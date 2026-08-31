/**
 * Shared chat vocabulary. Pure, so server actions and client components agree.
 */

/**
 * The reactions people can use.
 *
 * A fixed set rather than free emoji input: an arbitrary string field becomes a
 * second message body, and a closed set keeps the row small, the picker
 * scannable, and the validation trivial.
 */
export const REACTIONS = ["👍", "🎉", "❤️", "👀", "✅", "🔥"] as const;
export type Reaction = (typeof REACTIONS)[number];

/** Threads are one level deep — a reply cannot itself have replies. */
export const MAX_THREAD_DEPTH = 1;
