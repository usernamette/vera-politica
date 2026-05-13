import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, BadgeCheck, Activity, Bell, Vote, FileText, Wallet, AlertTriangle, ArrowRight } from "lucide-react";
import { useFollowed } from "@/lib/user-store";
import { camaraApi } from "@/lib/camara-api";
import { PartyBadge } from "@/components/site/PartyBadge";

export const Route = createFileRoute("/minha-area/")({
  head: () => ({ meta: [{ title: "Minha área — Brasil à Vera" }] }),
  component: DashboardPage,
});

type TimelineItem = {
  depId: number;
  depNome: string;
  depFoto: string;
  depPartido: string;
  type: "vote" | "proposition" | "expense";
  title: string;
  date: string;
  source: string;
  href: string;
};

function DashboardPage() {
  const favs = useFollowed("favorite");
  const voted = useFollowed("voted");
  const followed = useMemo(() => {
    const map = new Map<number, typeof favs[number]>();
    [...voted, ...favs].forEach((d) => map.set(d.id, d));
    return Array.from(map.values());
  }, [favs, voted]);

  const queries = useQueries({
    queries: followed.slice(0, 8).flatMap((d) => [
      {
        queryKey: ["dep-prop", d.id],
        queryFn: () => camaraApi.getDeputadoProposicoes(d.id),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["dep-desp", d.id, new Date().getFullYear()],
        queryFn: () => camaraApi.getDespesas(d.id, new Date().getFullYear()),
        staleTime: 5 * 60_000,
      },
    ]),
  });

  const items = useMemo<TimelineItem[]>(() => {
    const out: TimelineItem[] = [];
    followed.slice(0, 8).forEach((d, i) => {
      const propQ = queries[i * 2];
      const despQ = queries[i * 2 + 1];
      const props = (propQ?.data as any)?.dados ?? [];
      const desps = (despQ?.data as any)?.dados ?? [];
      props.slice(0, 2).forEach((p: any) => {
        out.push({
          depId: d.id, depNome: d.nome, depFoto: d.urlFoto, depPartido: d.siglaPartido,
          type: "proposition",
          title: `Apresentou ${p.siglaTipo} ${p.numero}/${p.ano}`,
          date: `${p.ano}`,
          source: "Câmara dos Deputados",
          href: `/proposicoes/${p.id}`,
        });
      });
      desps.slice(0, 2).forEach((e: any) => {
        out.push({
          depId: d.id, depNome: d.nome, depFoto: d.urlFoto, depPartido: d.siglaPartido,
          type: "expense",
          title: `Despesa: ${e.tipoDespesa} — R$ ${Number(e.valorLiquido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          date: `${String(e.mes).padStart(2, "0")}/${e.ano}`,
          source: "Cota parlamentar",
          href: `/parlamentares/${d.id}`,
        });
      });
    });
    return out.slice(0, 20);
  }, [followed, queries]);

  const cards = [
    { label: "Políticos acompanhados", value: followed.length, icon: Users, hint: "Favoritos + votados" },
    { label: "Políticos em quem votei", value: voted.length, icon: BadgeCheck, hint: "Marcados por você" },
    { label: "Novas movimentações", value: items.length, icon: Activity, hint: "Últimos registros" },
    { label: "Alertas importantes", value: 0, icon: Bell, hint: "Nenhum no momento" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Minha área</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Acompanhe durante o ano o trabalho dos políticos que você votou, favoritou ou quer fiscalizar.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{c.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{c.hint}</p>
          </motion.div>
        ))}
      </section>

      {followed.length === 0 ? (
        <EmptyState
          title="Você ainda não acompanha nenhum político."
          description="Salve políticos para monitorar votos, gastos e propostas durante todo o mandato."
          ctaLabel="Explorar parlamentares"
          ctaTo="/parlamentares"
        />
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Resumo do ano</h2>
              <p className="text-sm text-muted-foreground">Atividades recentes dos parlamentares que você acompanha.</p>
            </div>
            <Link to="/minha-area/acompanhados" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Carregando registros oficiais...
            </div>
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-4">
              {items.map((it, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                  className="relative"
                >
                  <span className="absolute -left-[22px] top-3 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-primary shadow-glow" />
                  <Link
                    to={it.href as any}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <img src={it.depFoto} alt={it.depNome} className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{it.depNome}</span>
                        <PartyBadge sigla={it.depPartido} />
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{it.title}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <TypeBadge type={it.type} />
                        <span>·</span>
                        <span>{it.date}</span>
                        <span>·</span>
                        <span className="rounded border border-border bg-secondary/50 px-1.5 py-0.5">{it.source}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </motion.li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: TimelineItem["type"] }) {
  const map = {
    vote: { label: "Votação", icon: Vote, cls: "text-info border-info/30 bg-info/10" },
    proposition: { label: "Proposição", icon: FileText, cls: "text-primary border-primary/30 bg-primary/10" },
    expense: { label: "Despesa", icon: Wallet, cls: "text-warning border-warning/30 bg-warning/10" },
  } as const;
  const t = map[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${t.cls}`}>
      <t.icon className="h-3 w-3" /> {t.label}
    </span>
  );
}

function EmptyState({ title, description, ctaLabel, ctaTo }: { title: string; description: string; ctaLabel: string; ctaTo: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      <p className="mt-4 text-base font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Link to={ctaTo as any} className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
        {ctaLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
