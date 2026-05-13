import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, LogOut, UserCircle2 } from "lucide-react";
import { auth, useUser, useMounted } from "@/lib/user-store";

const publicLinks = [
  { to: "/", label: "Início", exact: true },
  { to: "/parlamentares", label: "Parlamentares", exact: false },
  { to: "/proposicoes", label: "Proposições", exact: false },
  { to: "/votacoes", label: "Votações", exact: false },
  { to: "/analise", label: "Análises", exact: false },
  { to: "/metodologia", label: "Metodologia", exact: false },
] as const;

const privateLinks = [
  { to: "/minha-area", label: "Minha área", exact: true },
  { to: "/minha-area/acompanhados", label: "Acompanhados", exact: false },
  { to: "/minha-area/alertas", label: "Alertas", exact: false },
  { to: "/minha-area/configuracoes", label: "Configurações", exact: false },
] as const;

export function Navbar() {
  const mounted = useMounted();
  const user = useUser();
  const navigate = useNavigate();
  const logged = mounted && !!user;

  const links = logged ? privateLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">Brasil à Vera</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Transparência política</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-muted" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {logged ? (
            <>
              <Link
                to="/minha-area"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow"
                title={user!.name}
              >
                {user!.name.slice(0, 1).toUpperCase()}
              </Link>
              <button
                onClick={() => { auth.logout(); navigate({ to: "/" }); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-sm hover:bg-secondary"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium hover:bg-secondary"
            >
              <UserCircle2 className="h-4 w-4" /> Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
