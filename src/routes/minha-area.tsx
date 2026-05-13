import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Users, Bell, Settings, LogOut, UserCircle2 } from "lucide-react";
import { auth, useUser, useMounted } from "@/lib/user-store";

export const Route = createFileRoute("/minha-area")({
  component: MinhaAreaLayout,
});

const tabs = [
  { to: "/minha-area", label: "Resumo", icon: LayoutDashboard, exact: true },
  { to: "/minha-area/acompanhados", label: "Acompanhados", icon: Users, exact: false },
  { to: "/minha-area/meus-votos", label: "Meus votos", icon: UserCircle2, exact: false },
  { to: "/minha-area/alertas", label: "Alertas", icon: Bell, exact: false },
  { to: "/minha-area/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

function MinhaAreaLayout() {
  const mounted = useMounted();
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (mounted && !user) navigate({ to: "/login" });
  }, [mounted, user, navigate]);

  if (!mounted) return null;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* User chip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Sua área</p>
            <p className="text-base font-semibold">{user.name}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => { auth.logout(); navigate({ to: "/" }); }}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 text-sm hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>

      {/* Sub-nav */}
      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card/60 p-1 backdrop-blur">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm bg-gradient-primary text-primary-foreground shadow-glow" }}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
