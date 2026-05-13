import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { camaraApi } from "@/lib/camara-api";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie } from "recharts";

export const Route = createFileRoute("/analise")({
  head: () => ({ meta: [{ title: "Análises — Brasil à Vera" }] }),
  component: AnalisePage,
});

const COLORS = ["#3B82F6", "#22C55E", "#EF4444", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899", "#84CC16"];

function AnalisePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["deputados-all"],
    queryFn: () => camaraApi.listDeputados({ itens: 100 }),
    staleTime: 10 * 60_000,
  });

  const porPartido = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data?.dados ?? []) m.set(d.siglaPartido, (m.get(d.siglaPartido) || 0) + 1);
    return Array.from(m.entries()).map(([sigla, qtd]) => ({ sigla, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 12);
  }, [data]);

  const porUf = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data?.dados ?? []) m.set(d.siglaUf, (m.get(d.siglaUf) || 0) + 1);
    return Array.from(m.entries()).map(([uf, qtd]) => ({ uf, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 10);
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Visão agregada</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Dashboard analítico</h1>
      <p className="mt-1 text-sm text-muted-foreground">Distribuição da Câmara em uma amostra dos parlamentares ativos.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Parlamentares por partido" subtitle="Top 12">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={porPartido}>
                <XAxis dataKey="sigla" stroke="oklch(0.66 0.018 260)" fontSize={11} />
                <YAxis stroke="oklch(0.66 0.018 260)" fontSize={11} />
                <Tooltip cursor={{ fill: "oklch(1 0 0 / 0.04)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="qtd" radius={[6,6,0,0]}>
                  {porPartido.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
        <Panel title="Distribuição por UF" subtitle="Top 10 estados">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={porUf} dataKey="qtd" nameKey="uf" innerRadius={60} outerRadius={120} paddingAngle={2}>
                  {porUf.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.18 0.014 260)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 8, fontSize: 12 } as const;

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="h-[320px] animate-pulse rounded-lg bg-muted/40" />;
}
