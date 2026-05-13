import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const links = [
  { to: "/", label: "Início" },
  { to: "/parlamentares", label: "Parlamentares" },
  { to: "/proposicoes", label: "Proposições" },
  { to: "/votacoes", label: "Votações" },
  { to: "/analise", label: "Análises" },
  { to: "/metodologia", label: "Metodologia" },
] as const;

export function Navbar() {
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
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-muted" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/parlamentares"
          className="hidden rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary md:inline-flex"
        >
          Explorar dados
        </Link>
      </div>
    </header>
  );
}
