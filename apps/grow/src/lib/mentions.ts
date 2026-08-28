/**
 * @mention parsing.
 *
 * Deliberately dependency-free and pure so it can be unit tested and reused on
 * both the server (to decide who gets notified) and the client (to highlight
 * mentions as they are typed).
 *
 * Design note — why match against the directory instead of a regex like
 * /@(\w+)/: real names contain spaces ("Mahmoud Hassan"), and a naive token
 * regex would capture only "Mahmoud". Rather than force users to type an
 * artificial handle, we scan for the *known* names of real accounts. The
 * directory is small (staff only), so this stays cheap, and it means a mention
 * can only ever resolve to a real person — never a typo that silently notifies
 * nobody.
 */

export interface MentionCandidate {
  id: string;
  name: string;
  email: string;
}

export interface ResolvedMention {
  id: string;
  name: string;
  /** Character offset of the "@" in the source text. */
  start: number;
  /** Offset one past the end of the matched handle. */
  end: number;
  /** The literal text matched, without the leading "@". */
  matched: string;
}

/** A handle is anything a person can be addressed by after an "@". */
interface Handle {
  text: string;
  lower: string;
  user: MentionCandidate;
}

/**
 * Build the addressable handles for a directory.
 *
 * Each person contributes their full name and their email. A first name is
 * added only when it is unambiguous across the whole directory — with two
 * people called "Ahmed", "@Ahmed" should not silently pick one of them.
 */
export function buildHandles(users: MentionCandidate[]): Handle[] {
  const firstNameCounts = new Map<string, number>();
  for (const u of users) {
    const first = u.name.trim().split(/\s+/)[0]?.toLowerCase();
    if (first) firstNameCounts.set(first, (firstNameCounts.get(first) ?? 0) + 1);
  }

  const handles: Handle[] = [];
  for (const u of users) {
    const name = u.name.trim();
    if (name) handles.push({ text: name, lower: name.toLowerCase(), user: u });
    if (u.email) handles.push({ text: u.email, lower: u.email.toLowerCase(), user: u });

    const first = name.split(/\s+/)[0];
    if (first && first.toLowerCase() !== name.toLowerCase() && firstNameCounts.get(first.toLowerCase()) === 1) {
      handles.push({ text: first, lower: first.toLowerCase(), user: u });
    }
  }

  // Longest first so "@Mahmoud Hassan" wins over the bare "@Mahmoud" handle.
  return handles.sort((a, b) => b.lower.length - a.lower.length);
}

/** True when the character before an "@" allows it to start a mention. */
function boundaryBefore(text: string, at: number): boolean {
  if (at === 0) return true;
  // Guards against matching the "@" inside an email address that is itself
  // just being quoted in prose (e.g. "write to sam@growcdx.com").
  return /[\s(\[{,;:"']/.test(text[at - 1]);
}

/** True when a match ending at `end` is not butting up against more word text. */
function boundaryAfter(text: string, end: number): boolean {
  if (end >= text.length) return true;
  return !/[A-Za-z0-9]/.test(text[end]);
}

/**
 * Find every mention in `text` that resolves to a real account.
 *
 * Matches are non-overlapping and returned in document order. Each person is
 * reported once per occurrence; de-duplicate by id for notification purposes.
 */
export function findMentions(text: string, users: MentionCandidate[]): ResolvedMention[] {
  if (!text || users.length === 0) return [];
  const handles = buildHandles(users);
  const lower = text.toLowerCase();
  const out: ResolvedMention[] = [];

  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "@" || !boundaryBefore(text, i)) continue;

    for (const h of handles) {
      const end = i + 1 + h.lower.length;
      if (end > text.length) continue;
      if (lower.slice(i + 1, end) !== h.lower) continue;
      if (!boundaryAfter(text, end)) continue;

      out.push({ id: h.user.id, name: h.user.name, start: i, end, matched: h.text });
      i = end - 1; // resume after this match; no nested/overlapping mentions
      break;
    }
  }

  return out;
}

/** Unique account ids mentioned in `text`. */
export function mentionedUserIds(text: string, users: MentionCandidate[]): string[] {
  return [...new Set(findMentions(text, users).map((m) => m.id))];
}

export type Segment =
  | { type: "text"; value: string }
  | { type: "mention"; value: string; id: string };

/**
 * Split `text` into plain and mention segments for rendering.
 * Callers decide the styling; this only says where the mentions are.
 */
export function segmentMentions(text: string, users: MentionCandidate[]): Segment[] {
  const mentions = findMentions(text, users);
  if (mentions.length === 0) return [{ type: "text", value: text }];

  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of mentions) {
    if (m.start > cursor) segments.push({ type: "text", value: text.slice(cursor, m.start) });
    segments.push({ type: "mention", value: text.slice(m.start, m.end), id: m.id });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ type: "text", value: text.slice(cursor) });
  return segments;
}
