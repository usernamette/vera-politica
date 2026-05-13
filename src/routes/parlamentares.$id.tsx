import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, ExternalLink, Mail, MapPin } from "lucide-react";
import { camaraApi } from "@/lib/camara-api";
import { PartyBadge } from "@/components/site/PartyBadge";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export const Route = createFileRoute("/parlamentares/$id")({
  component: PerfilPage,
});

function PerfilPage() {
  const { id } = Route.useParams();

  const dep = useQuery({
    queryKey: ["dep", id],
    queryFn: () => camaraApi.getDeputado(id),
    staleTime: 10 * 60_000,
  });
  const desp = useQuery({
    queryKey: ["dep-despesas", id],
    queryFn: () => camaraApi.getDespesas(id),
    staleTime: 10 * 60_000,
  });
  const props = useQuery({
    queryKey: ["dep-props", id],
    queryFn: () => camaraApi.getDeputadoProposicoes(id),
    staleTime: 10 * 60_000,
  });

  const total = useMemo(
    () => (desp.data?.dados ?? []).reduce((s, d) => s + (d.valorLiquido || 0), 0),
    [desp.data]
  );

  const porCategoria = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of desp.data?.dados ?? []) m.set(d.tipoDespesa, (m.get(d.tipoDespesa) || 0) + d.valorLiquido);
    return Array.from(m.entries())
      .map(([categoria, valor]) => ({ categoria: categoria.length > 24 ? categoria.slice(0, 24) + "…" : categoria, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);
  }, [desp.data]);

  if (dep.isLoading) return <div className="mx-auto max-w-6xl px-6 py-16"><div className="h-72 animate-pulse rounded-2xl border border-border bg-card" /></div>;
  if (dep.isError || !dep.data) return <div className="mx-auto max-w-6xl px-6 py-16 text-muted-foreground">Não foi possível carregar este parlamentar.</div>;

  const d = dep.data.dados;
  const s = d.ultimoStatus;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/parlamentares" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* Header */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="h-32 bg-gradient-primary opacity-60" />
        <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
          <img
            src={s.urlFoto}
            alt={s.nome}
            className="-mt-20 h-32 w-32 rounded-2xl border-4 border-card object-cover shadow-glow md:h-40 md:w-40"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{s.nome}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <PartyBadge sigla={s.siglaPartido} />
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.siglaUf}</span>
              <span>· {s.condicaoEleitoral}</span>
              <span>· {s.situacao}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.email && (
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs hover:bg-secondary">
                  <Mail className="h-3.5 w-3.5" /> {s.email}
                </a>
              )}
              <a
                href={`https://www.camara.leg.br/deputados/${d.id}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Página oficial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <KPI label="Gasto total (cota)" value={formatCurrency(total)} accent="text-primary" />
        <KPI label="Despesas registradas" value={(desp.data?.dados.length ?? 0).toString()} />
        <KPI label="Proposições autoradas" value={(props.data?.dados.length ?? 0).toString()} />
        <KPI label="Legislatura" value={String(d.ultimoStatus ? "57ª" : "—")} />
      </div>

      {/* Expenses chart */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Gastos por categoria</h2>
        <p className="text-xs text-muted-foreground">Top 8 categorias da cota parlamentar</p>
        <div className="mt-4 h-72">
          {desp.isLoading ? (
            <div className="h-full animate-pulse rounded-lg bg-muted/40" />
          ) : porCategoria.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados de despesa.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porCategoria} layout="vertical" margin={{ left: 16, right: 16 }}>
                <XAxis type="number" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} stroke="oklch(0.66 0.018 260)" fontSize={11} />
                <YAxis type="category" dataKey="categoria" stroke="oklch(0.66 0.018 260)" fontSize={11} width={180} />
                <Tooltip
                  cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                  contentStyle={{ background: "oklch(0.18 0.014 260)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                  {porCategoria.map((_, i) => (
                    <Cell key={i} fill={`oklch(0.65 0.19 ${260 - i * 8})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Propositions */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Proposições recentes</h2>
        <div className="mt-4 grid gap-2">
          {(props.data?.dados ?? []).slice(0, 10).map((p) => (
            <Link
              key={p.id}
              to="/proposicoes/$id"
              params={{ id: String(p.id) }}
              className="group flex items-start justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/60"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary">{p.siglaTipo} {p.numero}/{p.ano}</div>
                <p className="mt-1 line-clamp-2 text-sm text-foreground">{p.ementa}</p>
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
          {(props.data?.dados ?? []).length === 0 && !props.isLoading && (
            <p className="text-sm text-muted-foreground">Nenhuma proposição encontrada.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tracking-tight ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
