import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Vote, FileText, Wallet, AlertTriangle, Activity, TrendingUp, UserMinus, Bell } from "lucide-react";
import { useFollowed } from "@/lib/user-store";

export const Route = createFileRoute("/minha-area/alertas")({
  head: () => ({ meta: [{ title: "Alertas — Brasil à Vera" }] }),
  component: AlertasPage,
});

type Severity = "info" | "important" | "critical" | "positive";
type AlertItem = {
  type: string;
  severity: Severity;
  icon: any;
  description: string;
  date: string;
  source: string;
  href: string;
};

const TEMPLATES: Array<Omit<AlertItem, "date">> = [
  { type: "Nova votação registrada", severity: "info", icon: Vote, description: "Participou de votação nominal recente.", source: "Câmara dos Deputados", href: "/votacoes" },
  { type: "Nova proposição apresentada", severity: "info", icon: FileText, description: "Apresentou novo projeto na Câmara.", source: "Câmara dos Deputados", href: "/proposicoes" },
  { type: "Nova despesa parlamentar", severity: "info", icon: Wallet, description: "Registro de despesa na cota parlamentar.", source: "Cota parlamentar", href: "/" },
  { type: "Divergência com a bancada", severity: "important", icon: TrendingUp, description: "Votou diferente da orientação do partido.", source: "Câmara dos Deputados", href: "/votacoes" },
  { type: "Aumento relevante de gastos", severity: "critical", icon: AlertTriangle, description: "Crescimento expressivo de despesas no mês.", source: "Cota parlamentar", href: "/" },
  { type: "Ausência em votação", severity: "important", icon: UserMinus, description: "Não compareceu a votação importante.", source: "Câmara dos Deputados", href: "/votacoes" },
  { type: "Votação importante", severity: "positive", icon: Activity, description: "Pauta relevante votada esta semana.", source: "Câmara dos Deputados", href: "/votacoes" },
];

function AlertasPage() {
  const followed = useFollowed("voted").concat(useFollowed("favorite"));

  const alerts = useMemo(() => {
    if (followed.length === 0) return [] as Array<AlertItem & { dep: typeof followed[number] }>;
    return followed.flatMap((d, i) =>
      TEMPLATES.slice(0, 3).map((t, j) => ({
        ...t,
        dep: d,
        date: relativeDate(i * 2 + j),
      }))
    ).slice(0, 14);
  }, [followed]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Alertas</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Receba sinais importantes sobre movimentações dos políticos que você acompanha.
        </p>
      </header>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold">Nenhum alerta para mostrar.</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Acompanhe parlamentares para começar a receber alertas sobre suas movimentações.
          </p>
          <Link to="/parlamentares" className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            Explorar parlamentares
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a, i) => (
            <li key={i}>
              <Link to={a.href as any} className={`group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors ${sevBorder(a.severity)} hover:border-primary/40`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${sevBg(a.severity)}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <img src={a.dep.urlFoto} alt={a.dep.nome} className="h-9 w-9 rounded-md border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{a.type}</p>
                    <SevBadge severity={a.severity} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{a.dep.nome}</span> — {a.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{a.date}</span>
                    <span>·</span>
                    <span className="rounded border border-border bg-secondary/50 px-1.5 py-0.5">{a.source}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-muted-foreground">
        Alguns alertas são exemplos baseados em dados simulados enquanto integramos o monitoramento contínuo.
      </p>
    </div>
  );
}

function sevBorder(s: Severity) {
  return {
    info: "border-info/30",
    important: "border-warning/30",
    critical: "border-destructive/30",
    positive: "border-success/30",
  }[s];
}
function sevBg(s: Severity) {
  return {
    info: "bg-info/15 text-info",
    important: "bg-warning/15 text-warning",
    critical: "bg-destructive/15 text-destructive",
    positive: "bg-success/15 text-success",
  }[s];
}
function SevBadge({ severity }: { severity: Severity }) {
  const label = { info: "Informativo", important: "Importante", critical: "Crítico", positive: "Positivo" }[severity];
  return <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sevBorder(severity)} ${sevBg(severity)}`}>{label}</span>;
}
function relativeDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("pt-BR");
}
