import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, X, Sparkles, FileText, ArrowUpRight, Bookmark, Share2,
  Clock, TrendingUp, Flame, Building2,
} from "lucide-react";
import { camaraApi, type Proposicao } from "@/lib/camara-api";
import { TEMAS, TIPOS, inferStatus, statusBadgeClasses, shortHook, humanize } from "@/lib/proposicao-utils";
import { projetoStore, useFollowedProjetos, useMounted } from "@/lib/user-store";
import { toast } from "sonner";

export const Route = createFileRoute("/proposicoes")({
  head: () => ({
    meta: [
      { title: "Projetos em tramitação — Brasil à Vera" },
      { name: "description", content: "Acompanhe projetos de lei, PECs e propostas que estão em discussão no Congresso." },
    ],
  }),
  component: ProjetosPage,
});

function ProjetosPage() {
  const currentYear = new Date().getFullYear();
  const [tipo, setTipo] = useState<string>("PL");
  const [ano, setAno] = useState<number>(currentYear);
  const [tema, setTema] = useState<number | null>(null);
  const [partido, setPartido] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["projetos", tipo, ano, tema, partido],
    queryFn: () => camaraApi.listProposicoes({
      siglaTipo: tipo || undefined,
      ano,
      codTema: tema ?? undefined,
      siglaPartidoAutor: partido || undefined,
      itens: 30,
    }),
    staleTime: 5 * 60_000,
  });

  const list: Proposicao[] = useMemo(() => {
    const all = data?.dados ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((p) =>
      p.ementa.toLowerCase().includes(q) ||
      `${p.siglaTipo} ${p.numero}/${p.ano}`.toLowerCase().includes(q)
    );
  }, [data, search]);

  const hasFilters = tipo !== "PL" || ano !== currentYear || tema !== null || partido !== "" || search !== "";

  const clearAll = () => {
    setTipo("PL"); setAno(currentYear); setTema(null); setPartido(""); setSearch("");
  };

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-hero">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>O que está acontecendo no Congresso</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-gradient md:text-5xl">
            Projetos em tramitação
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Acompanhe projetos de lei, PECs e propostas que estão em discussão no Congresso —
            traduzidos em linguagem simples, com contexto político e o status real de cada um.
          </p>

          {/* Barra de busca */}
          <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-card/80 p-1.5 shadow-soft backdrop-blur">
            <Search className="ml-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busque por tema, palavra-chave ou número (ex: PL 1234/2024)"
              className="h-10 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        {/* Sidebar / filtros */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filtros</h2>
              {hasFilters && (
                <button onClick={clearAll} className="text-xs text-primary hover:underline">Limpar</button>
              )}
            </div>

            <FieldLabel>Tipo de projeto</FieldLabel>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40">
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <FieldLabel>Ano</FieldLabel>
            <input type="number" value={ano} min={2000} max={currentYear}
              onChange={(e) => setAno(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />

            <FieldLabel>Partido do autor</FieldLabel>
            <input value={partido} onChange={(e) => setPartido(e.target.value.toUpperCase())}
              placeholder="Ex: PT, PL, PSDB"
              className="h-10 w-full rounded-md border border-border bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />

            <div className="mt-5 rounded-lg border border-dashed border-border/70 bg-background/40 p-3">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Linguagem cidadã
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Traduzimos a ementa oficial em uma frase curta, para você entender rápido o que cada projeto propõe.
              </p>
            </div>
          </div>
        </aside>

        {/* Lista */}
        <div>
          {/* Tema chips */}
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Temas em alta</p>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={tema === null} onClick={() => setTema(null)}>Todos</Chip>
              {TEMAS.map((t) => (
                <Chip key={t.codTema} active={tema === t.codTema} onClick={() => setTema(t.codTema)}>
                  <span className="mr-1">{t.emoji}</span>{t.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Header da lista */}
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {tema !== null
                  ? <>Projetos em <span className="text-primary">{TEMAS.find(t => t.codTema === tema)?.label}</span></>
                  : "Projetos recentes"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isFetching ? "Atualizando…" : `${list.length} projeto(s) encontrado(s)`}
              </p>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground md:inline-flex">
              <Flame className="h-3 w-3 text-warning" /> Mais movimentados primeiro
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState onClear={clearAll} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((p, i) => <ProjectCard key={p.id} p={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all " +
        (active
          ? "border-primary/50 bg-primary/15 text-primary shadow-glow"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/30 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

function ProjectCard({ p, index }: { p: Proposicao; index: number }) {
  const mounted = useMounted();
  const followed = useFollowedProjetos();
  const isSaved = mounted && followed.some((f) => f.id === p.id);
  // Sem dados de status do endpoint de listagem; usamos um estado neutro "tramitando"
  const status = inferStatus("Em tramitação");

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    projetoStore.toggle({ id: p.id, siglaTipo: p.siglaTipo, numero: p.numero, ano: p.ano, ementa: p.ementa });
    toast.success(isSaved ? "Projeto removido dos acompanhados" : "Projeto adicionado aos acompanhados");
  };
  const onShare = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/proposicoes/${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${p.siglaTipo} ${p.numero}/${p.ano}`, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copiado"); }
    } catch { /* cancelled */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.25) }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-[0.05]" />
      <Link to="/proposicoes/$id" params={{ id: String(p.id) }} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              {p.siglaTipo}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{p.numero}/{p.ano}</span>
            <span className={"ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " + statusBadgeClasses(status.kind)}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {status.label}
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Hook + ementa */}
        <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
          {shortHook(p.ementa)}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {humanize(p.ementa)}
        </p>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> Câmara dos Deputados</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.ano}</span>
          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> Texto oficial disponível</span>
        </div>
      </Link>

      {/* Footer ações */}
      <div className="flex items-center justify-between border-t border-border/60 bg-background/40 px-5 py-2.5">
        <Link to="/proposicoes/$id" params={{ id: String(p.id) }} className="text-xs font-semibold text-primary hover:underline">
          Ver detalhes →
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={onShare} title="Compartilhar"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onSave} title={isSaved ? "Deixar de acompanhar" : "Acompanhar projeto"}
            className={"inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors " +
              (isSaved
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground")}>
            <Bookmark className={"h-3 w-3 " + (isSaved ? "fill-current" : "")} />
            {isSaved ? "Acompanhando" : "Acompanhar"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold">Nenhum projeto encontrado</h3>
      <p className="mt-1 text-sm text-muted-foreground">Tente alterar ou remover alguns filtros para ampliar a busca.</p>
      <button onClick={onClear} className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
        Limpar filtros
      </button>
    </div>
  );
}
