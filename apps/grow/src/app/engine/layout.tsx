/**
 * Engine module root layout. Wraps everything under /engine in `.engine-scope`
 * so the engine's light shadcn-style theme (its own --card/--border/… tokens)
 * applies here without affecting the hub's dark Institutional-Tech theme.
 * The console sidebar lives in (console)/layout.tsx; the client portal renders
 * inside this scope but without that sidebar.
 */
export default function EngineLayout({ children }: { children: React.ReactNode }) {
  return <div className="engine-scope min-h-screen bg-background text-foreground">{children}</div>;
}
