import { notFound } from "next/navigation";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db, meetings, transcripts, sowDocuments, prerequisiteForms, clients } from "@growengine/db";
import { isMayaConfigured } from "@growengine/core";
import { prisma } from "@/lib/db";
import { requireTeamUser } from "@/lib/engine/session";
import {
  uploadRecording,
  reanalyzeMeeting,
  generateSow,
  savePrerequisiteResponses,
  inviteMaya,
  dismissMaya,
  refreshMaya,
  createTasksFromMeeting,
  type MeetingActionItem,
} from "@/app/engine/_actions/meetings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/engine/ui/card";
import { Badge, statusVariant } from "@/components/engine/ui/badge";
import { Button } from "@/components/engine/ui/button";
import { Input, Label, Select, Textarea } from "@/components/engine/ui/input";
import { Markdown } from "@/components/engine/markdown";
import { ConfidenceBadge } from "@/components/engine/ui/progress";
import { AutoRefresh } from "@/components/engine/auto-refresh";
import { jsonArray, jsonObject } from "@/lib/engine/json";
import { ActionForm } from "@/components/engine/action-form";

/** What each Vexa bot status means to a person in the call. */
const BOT_STATUS_LABEL: Record<string, string> = {
  requested: "Maya is on her way to the meeting.",
  joining: "Maya is joining now.",
  awaiting_admission: "Maya is knocking — admit her in the meeting to let her in.",
  needs_help: "Maya could not get in. Check the link or passcode, then invite her again.",
  active: "Maya is in the meeting and listening.",
  stopping: "Maya is leaving the meeting.",
  completed: "Maya has left; the notes are being written.",
  failed: "Maya could not join this meeting.",
};

type LiveNote = { at: number; speaker: string | null; kind: string; text: string };
type MentionedDocument = {
  type: string;
  title: string;
  audience: string;
  brief: string;
  requestedBy?: string;
  status: "requested" | "drafted" | "failed";
  documentId?: string;
  error?: string;
};

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireTeamUser();

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) notFound();

  const [client] = await db.select().from(clients).where(eq(clients.id, meeting.clientId));
  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.meetingId, id));
  const sows = await db
    .select()
    .from(sowDocuments)
    .where(and(eq(sowDocuments.meetingId, id), eq(sowDocuments.tenantId, user.tenantId)))
    .orderBy(desc(sowDocuments.createdAt));
  const [form] = meeting.prerequisiteFormId
    ? await db.select().from(prerequisiteForms).where(eq(prerequisiteForms.id, meeting.prerequisiteFormId))
    : [];
  const projects = await prisma.project.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } });

  // MariaDB returns json() columns as strings — always through jsonArray/jsonObject.
  const requirements = jsonArray<{ text: string; priority: string; evidenceQuote: string }>(meeting.extractedRequirements);
  const challenges = jsonArray<{ text: string; severity: string; evidenceQuote: string }>(meeting.extractedChallenges);
  const actionItems = jsonArray<MeetingActionItem>(meeting.actionItems);
  const prereqResponses = jsonObject<Record<string, string>>(meeting.prerequisiteResponses);
  const liveNotes = jsonArray<LiveNote>(meeting.liveNotes);
  const documents = jsonArray<MentionedDocument>(meeting.mentionedDocuments);
  const segments = jsonArray<{ start: number; end: number; text: string; speaker?: string; interim?: boolean }>(transcript?.segments);

  const mayaConfigured = isMayaConfigured();
  const mayaLive = Boolean(meeting.botMeetingId && !meeting.botEndedAt);
  const pendingItems = actionItems.map((item, index) => ({ item, index })).filter(({ item }) => !item.taskId);
  const createdItems = actionItems.filter((item) => item.taskId);

  return (
    <div className="space-y-5">
      {mayaLive && <AutoRefresh intervalMs={15_000} />}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={statusVariant(meeting.status)}>{meeting.status.replace(/_/g, " ")}</Badge>
            <Link href={`/engine/clients/${meeting.clientId}`} className="text-primary underline">{client?.name}</Link>
            {meeting.analysisConfidence && (
              <ConfidenceBadge score={meeting.analysisConfidence} />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {meeting.status === "analyzed" && (
            <>
              <ActionForm action={generateSow.bind(null, meeting.id)}>
                <Button size="sm">Generate SOW</Button>
              </ActionForm>
              <ActionForm action={reanalyzeMeeting.bind(null, meeting.id)}>
                <Button size="sm" variant="outline">Re-analyze</Button>
              </ActionForm>
            </>
          )}
        </div>
      </div>

      {/* ── Maya ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Maya, the meeting agent</CardTitle>
          <CardDescription>
            Maya joins Google Meet or Teams as a participant, transcribes with speaker names, and takes
            note of anything said to her: &ldquo;Maya, note that…&rdquo;, &ldquo;Maya, action item…&rdquo;,
            &ldquo;Maya, prepare a proposal for…&rdquo;. After the call she writes the minutes and drafts the
            documents that were promised.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mayaConfigured && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Maya is not configured on this server yet: <code>VEXA_API_KEY</code> is missing from
              <code> .grow.env</code>. DEPLOYMENT.md (&ldquo;Maya&rdquo;) has the three lines to add.
            </p>
          )}

          {mayaLive ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={meeting.botStatus === "active" ? "success" : meeting.botStatus === "needs_help" ? "destructive" : "warning"}>
                  {(meeting.botStatus ?? "requested").replace(/_/g, " ")}
                </Badge>
                <span className="text-sm">{BOT_STATUS_LABEL[meeting.botStatus ?? "requested"] ?? meeting.botStatus}</span>
              </div>
              <div className="flex gap-2">
                <ActionForm action={refreshMaya.bind(null, meeting.id)} successMessage="Refreshed.">
                  <Button size="sm" variant="outline">Refresh notes</Button>
                </ActionForm>
                <ActionForm action={dismissMaya.bind(null, meeting.id)} successMessage="Maya is leaving.">
                  <Button size="sm" variant="outline">Dismiss Maya</Button>
                </ActionForm>
              </div>
              <p className="text-xs text-muted-foreground">This page refreshes itself every 15 seconds while Maya is in the call.</p>
            </div>
          ) : (
            mayaConfigured && (
              <ActionForm action={inviteMaya.bind(null, meeting.id)} className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
                <div>
                  <Label>Meeting link, or the Teams Meeting ID</Label>
                  <Input
                    name="meetingLink"
                    defaultValue={meeting.meetingUrl ?? ""}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx · https://teams.live.com/meet/123… · 234 567 890 123"
                    required
                  />
                </div>
                <div>
                  <Label>Teams passcode (if any)</Label>
                  <Input name="passcode" placeholder="From the invite" />
                </div>
                <Button type="submit">Invite Maya</Button>
                <p className="text-xs text-muted-foreground md:col-span-3">
                  Maya knocks like any guest — someone in the call has to admit her. On Teams, paste the
                  numeric Meeting ID and passcode printed in the invite; the long
                  &ldquo;meetup-join&rdquo; link does not carry them.
                </p>
              </ActionForm>
            )
          )}

          {liveNotes.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-semibold">What the team told Maya ({liveNotes.length})</div>
              <div className="space-y-1.5">
                {liveNotes.map((n, i) => (
                  <div key={i} className="flex gap-3 rounded-md border p-2 text-sm">
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{mmss(n.at)}</span>
                    <Badge variant={n.kind === "action" ? "warning" : n.kind === "decision" ? "success" : "secondary"}>{n.kind}</Badge>
                    <span>{n.speaker ? <span className="font-medium">{n.speaker}: </span> : null}{n.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mayaLive && segments.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-semibold">Live transcript (last minutes)</div>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
                {segments.slice(-25).map((s, i) => (
                  <div key={i} className={`flex gap-3 ${s.interim ? "text-muted-foreground" : ""}`}>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{mmss(s.start)}</span>
                    <span>{s.speaker ? <span className="font-medium">{s.speaker}: </span> : null}{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {form && meeting.status === "awaiting_prereqs" && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-meeting prerequisites — {form.name}</CardTitle>
            <CardDescription>Captured before the meeting; feeds the AI analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={savePrerequisiteResponses.bind(null, meeting.id)} className="space-y-3">
              {jsonArray<{ key: string; label: string; type: string; required?: boolean }>(form.fields).map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea name={`field_${f.key}`} rows={3} required={f.required} />
                  ) : (
                    <Input name={`field_${f.key}`} required={f.required} />
                  )}
                </div>
              ))}
              <Button type="submit">Save responses</Button>
            </ActionForm>
          </CardContent>
        </Card>
      )}

      {Object.keys(prereqResponses).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Prerequisite responses</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            {Object.entries(prereqResponses).map(([k, v]) => (
              <div key={k} className="rounded-md bg-muted/50 p-2">
                <div className="text-xs font-semibold text-muted-foreground">{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!meeting.recordingStorageKey && !transcript && !mayaLive && meeting.status !== "awaiting_prereqs" && (
        <Card>
          <CardHeader>
            <CardTitle>Or upload a recording</CardTitle>
            <CardDescription>
              For a call Maya was not in. Transcription runs in the AI worker — local whisper.cpp when
              configured, OpenAI Whisper otherwise — then the same analysis, minutes and documents follow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={uploadRecording.bind(null, meeting.id)} className="flex items-center gap-3">
              <input type="file" name="recording" accept="audio/*,video/*" required className="text-sm" />
              <Button type="submit">Upload & analyze</Button>
            </ActionForm>
          </CardContent>
        </Card>
      )}

      {["transcribing", "analyzing", "recorded"].includes(meeting.status) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          The pipeline is running in the background ({meeting.status}). Refresh to see progress.
        </div>
      )}

      {meeting.summary && (
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="text-sm leading-6">{meeting.summary}</CardContent>
        </Card>
      )}

      {meeting.status === "analyzed" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Requirements ({requirements.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {requirements.map((r, i) => (
                <div key={i} className="rounded-md border p-2 text-sm">
                  <Badge variant={r.priority === "must" ? "destructive" : r.priority === "should" ? "warning" : "secondary"}>{r.priority}</Badge>
                  <p className="mt-1">{r.text}</p>
                  <p className="mt-1 text-xs italic text-muted-foreground">&ldquo;{r.evidenceQuote}&rdquo;</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Challenges ({challenges.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {challenges.map((c, i) => (
                <div key={i} className="rounded-md border p-2 text-sm">
                  <Badge variant={c.severity === "high" ? "destructive" : c.severity === "medium" ? "warning" : "secondary"}>{c.severity}</Badge>
                  <p className="mt-1">{c.text}</p>
                  <p className="mt-1 text-xs italic text-muted-foreground">&ldquo;{c.evidenceQuote}&rdquo;</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Action items ({actionItems.length})</CardTitle>
              <CardDescription>Maya proposes; you approve. Tick the ones that belong on the board.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingItems.length > 0 && (
                <ActionForm action={createTasksFromMeeting.bind(null, meeting.id)} className="space-y-2" successMessage="Tasks created.">
                  {pendingItems.map(({ item, index }) => (
                    <label key={index} className="flex cursor-pointer gap-2 rounded-md border p-2 text-sm">
                      <input type="checkbox" name="items" value={index} defaultChecked className="mt-1" />
                      <span>
                        <span>{item.text}</span>
                        <span className="block text-xs text-muted-foreground">{item.owner || "owner not stated"}{item.due ? ` · due ${item.due}` : ""}</span>
                      </span>
                    </label>
                  ))}
                  <div className="flex items-end gap-2">
                    <div className="grow">
                      <Label>Project</Label>
                      <Select name="projectId" required defaultValue={projects.find((p) => client && p.title.toLowerCase().includes(client.name.toLowerCase()))?.id ?? ""}>
                        <option value="">Choose a project…</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </Select>
                    </div>
                    <Button type="submit" size="sm">Create tasks</Button>
                  </div>
                </ActionForm>
              )}
              {createdItems.map((item, i) => (
                <div key={`done-${i}`} className="rounded-md border border-emerald-200 bg-emerald-50/50 p-2 text-sm">
                  <p>{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.owner}{item.due ? ` · due ${item.due}` : ""} · on the board</p>
                </div>
              ))}
              {actionItems.length === 0 && <p className="text-sm text-muted-foreground">No action items were found in this meeting.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents mentioned in the meeting ({documents.length})</CardTitle>
            <CardDescription>Drafted by Maya into the knowledge base for a person to review before anything reaches a client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((d, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                <div>
                  <Badge variant="secondary">{d.type}</Badge>{" "}
                  <Badge variant={d.audience === "client" ? "warning" : "secondary"}>{d.audience}</Badge>{" "}
                  <span className="font-medium">{d.title}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{d.brief}</p>
                  {d.error && <p className="mt-1 text-xs text-red-700">{d.error}</p>}
                </div>
                {d.status === "drafted" && d.documentId ? (
                  <Link href={`/engine/aom/doc/${d.documentId}`} className="text-primary underline">Open draft</Link>
                ) : (
                  <Badge variant={d.status === "failed" ? "destructive" : "warning"}>{d.status === "requested" ? "drafting…" : d.status}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {meeting.minutesMarkdown && (
        <Card>
          <CardHeader><CardTitle>Minutes of meeting</CardTitle></CardHeader>
          <CardContent><Markdown content={meeting.minutesMarkdown} /></CardContent>
        </Card>
      )}

      {meeting.expectationBaseline && (
        <Card>
          <CardHeader><CardTitle>Expectation Baseline</CardTitle></CardHeader>
          <CardContent><Markdown content={meeting.expectationBaseline} /></CardContent>
        </Card>
      )}

      {sows.map((sow) => (
        <Card key={sow.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{sow.title}</CardTitle>
            <div className="flex items-center gap-2">
              <ConfidenceBadge score={sow.generationConfidence} />
              <Badge variant={statusVariant(sow.status)}>{sow.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {sow.documentMarkdown ? (
              <Markdown content={sow.documentMarkdown} />
            ) : (
              <p className="text-sm text-muted-foreground">SOW generation in progress…</p>
            )}
          </CardContent>
        </Card>
      ))}

      {transcript && !mayaLive && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              {transcript.engine} · {transcript.wordCount} words · {transcript.language ?? "auto"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-1.5 overflow-y-auto text-sm">
              {segments.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{mmss(s.start)}</span>
                  <span>{s.speaker ? <span className="font-medium">{s.speaker}: </span> : null}{s.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
