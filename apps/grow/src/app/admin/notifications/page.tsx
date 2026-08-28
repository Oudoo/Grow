import Link from "next/link";
import { redirect } from "next/navigation";
import { AtSign, Bell, CalendarClock, CheckCheck, MessageSquare, UserPlus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { recentNotifications } from "@/lib/notify";
import { isMailConfigured } from "@/lib/mail";
import { markAllNotificationsReadAction, markNotificationReadAction } from "./actions";

export const dynamic = "force-dynamic";

const ICON: Record<string, typeof Bell> = {
  mention: AtSign,
  assigned: UserPlus,
  comment: MessageSquare,
  status: CheckCheck,
  due_soon: CalendarClock,
  overdue: CalendarClock,
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const items = await recentNotifications(session.uid, 60);
  const unread = items.filter((n) => !n.readAt).length;
  const mailReady = isMailConfigured();

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-cyan" />
            Notifications
          </h1>
          <p className="text-slate">
            {unread > 0 ? `${unread} unread` : "You are all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="bg-fg/5 border border-fg/10 text-slate hover:text-platinum text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              Mark all read
            </button>
          </form>
        )}
      </div>

      {/* Email delivery is optional; say so plainly rather than letting people
          wonder why an in-app notification never reached their inbox. */}
      {!mailReady && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-sm text-amber-300">
          <strong className="font-bold">Email delivery is not configured.</strong>{" "}
          Notifications appear here, but no email is sent. Set the SMTP_* values in
          <code className="mx-1 px-1.5 py-0.5 rounded bg-void/60 text-xs">.grow.env</code>
          — queued notifications send automatically once they are set.
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-fg/5 border-dashed rounded-2xl text-slate">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>Nothing yet. Mentions, assignments and due dates will show up here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const Icon = ICON[n.kind] ?? Bell;
            const body = (
              <div className={`flex gap-4 p-4 rounded-2xl border transition-colors ${
                n.readAt
                  ? "bg-obsidian border-fg/10"
                  : "bg-cyan/[0.06] border-cyan/25"
              }`}>
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${n.readAt ? "text-slate" : "text-cyan"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.readAt ? "text-slate" : "text-platinum font-semibold"}`}>
                    {n.title}
                  </p>
                  {n.body && <p className="text-xs text-slate mt-1 line-clamp-2">{n.body}</p>}
                  <p className="text-[10px] text-slate/70 mt-1.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.readAt && <span className="w-2 h-2 rounded-full bg-cyan shrink-0 mt-2" />}
              </div>
            );

            return (
              <li key={n.id}>
                {n.url ? (
                  // Following the link also clears it — arriving at the task is
                  // the moment the notification has done its job.
                  <form action={markNotificationReadAction.bind(null, n.id)}>
                    <Link href={n.url} className="block" prefetch={false}>
                      {body}
                    </Link>
                    <button type="submit" className="sr-only">Mark read</button>
                  </form>
                ) : (
                  <form action={markNotificationReadAction.bind(null, n.id)}>
                    <button type="submit" className="w-full text-left">{body}</button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
