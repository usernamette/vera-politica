import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Bookmark, Share2, Sparkles,
  CheckCircle2, Circle, AlertCircle, Archive, Gavel, FileText,
  Building2, Calendar, Users, ScrollText,
} from "lucide-react";
import { camaraApi } from "@/lib/camara-api";
import { humanize, shortHook, inferStatus, statusBadgeClasses } from "@/lib/proposicao-utils";
import { projetoStore, useFollowedProjetos, useMounted } from "@/lib/user-store";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/proposicoes/$id")({
  component: PropDetail,
});

function PropDetail() {
  const { id } = Route.useParams();

  const propQ = useQuery({
    queryKey: ["prop", id],
    queryFn: () => camaraApi.getProposicao(id),
    staleTime: 10 * 60_000,
  });
  const tramQ = useQuery({
    queryKey: ["prop-tram", id],
    queryFn: () => camaraApi.getProposicaoTramitacoes(id),
    staleTime: 10 * 60_000,
  });
  const autoresQ = useQuery({
    queryKey: ["prop-autores", id],
    queryFn: () => camaraApi.getProposicaoAutores(id),
    staleTime: 10 * 60_000,
  });

  const mounted = useMounted();
  const followed = useFollowedProjetos();
  const tramitacoes = useMemo(
    () => (tramQ.data?.dados ?? []).slice().sort((a, b) => (b.dataHora ?? "").localeCompare(a.dataHora ?? "")),
    [tramQ.data]
  );

  if (propQ.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="h-8 w-32 animate-pulse rounded bg-card" />
        <div className="mt-6 h-72 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
      </div>
    );
  }
  if (propQ.isError || !propQ.data) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-muted-foreground">Não foi possível carregar este projeto.</div>;
  }

  const p = propQ.data.dados;
  const status = inferStatus(p.statusProposicao?.descricaoSituacao);
  const isSaved = mounted && followed.some((f) => f.id === p.id);
  const autores = autoresQ.data?.dados ?? [];

  const onSave = () => {
    projetoStore.toggle({ id: p.id, siglaTipo: p.siglaTipo, numero: p.numero, ano: p.ano, ementa: p.ementa });
    toast.success(isSaved ? "Projeto removido dos acompanhados" : "Projeto adicionado aos acompanhados");
  };
  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${p.siglaTipo} ${p.numero}/${p.ano}`, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copiado"); }
    } catch { /* cancelled */ }
  };

  // Heurísticas de impacto a partir de palavras-chave
  const text = `${p.ementa} ${p.keywords ?? ""}`.toLowerCase();
  const impactos = [
    { match: /educa|escola|ensino|aluno|professor/, label: "Afeta educação", emoji: "📚" },
    { match: /sa[uú]de|hospital|s[uú]s|m[eé]dic|paciente/, label: "Afeta saúde", emoji: "🏥" },
    { match: /imposto|tribut|icms|iss|fisc|isen[çc]/, label: "Afeta impostos", emoji: "🧾" },
    { match: /trabalh|emprego|sal[aá]rio|clt|previd[eê]nc/, label: "Afeta trabalhadores", emoji: "👷" },
    { match: /ambient|ecol|sustenta|amaz[oô]n|clima|emiss/, label: "Afeta meio ambiente", emoji: "🌱" },
    { match: /seguran|polic|crime|pena|arma/, label: "Afeta segurança", emoji: "🛡️" },
    { match: /transport|mobilidade|ve[ií]culo|trans[ií]to/, label: "Afeta transporte", emoji: "🚌" },
    { match: /direit|igual|minoria|g[eê]nero|ra[çc]/, label: "Afeta direitos", emoji: "✊" },
  ].filter((i) => i.match.test(text));

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-border/60 bg-hero">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Link to="/proposicoes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar para projetos
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              {p.siglaTipo}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{p.numero}/{p.ano}</span>
            <span className={"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider " + statusBadgeClasses(status.kind)}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {status.label}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gradient md:text-4xl">
            {shortHook(p.ementa)}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {humanize(p.ementa)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button onClick={onSave}
              className={"inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors " +
                (isSaved
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-secondary/60 hover:bg-secondary")}>
              <Bookmark className={"h-4 w-4 " + (isSaved ? "fill-current" : "")} />
              {isSaved ? "Acompanhando" : "Acompanhar projeto"}
            </button>
            <button onClick={onShare} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3.5 py-2 text-sm font-medium hover:bg-secondary">
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
            <a href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              Ver na Câmara <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Resumo rápido */}
          <Card>
            <CardHeader icon={<Sparkles className="h-4 w-4" />} title="Resumo rápido" subtitle="O que este projeto quer fazer?" />
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">
              {humanize(p.ementaDetalhada || p.ementa)}
            </p>
            {p.keywords && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Palavras-chave</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.keywords.split(",").slice(0, 16).map((k, i) => (
                    <span key={i} className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground">
                      {k.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Impacto potencial */}
          {impactos.length > 0 && (
            <Card>
              <CardHeader icon={<AlertCircle className="h-4 w-4" />} title="Impacto potencial" subtitle="Áreas que podem ser afetadas se aprovado" />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {impactos.map((i) => (
                  <div key={i.label} className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm">
                    <span className="text-base">{i.emoji}</span>
                    <span className="font-medium">{i.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Situação atual / Timeline */}
          <Card>
            <CardHeader icon={<ScrollText className="h-4 w-4" />} title="Situação atual" subtitle="Histórico de tramitação no Congresso" />
            {tramQ.isLoading ? (
              <div className="mt-4 h-32 animate-pulse rounded-lg bg-secondary/40" />
            ) : tramitacoes.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Sem registros de tramitação disponíveis.</p>
            ) : (
              <ol className="mt-5 space-y-0">
                {tramitacoes.slice(0, 12).map((t, i) => {
                  const k = inferStatus(t.descricaoSituacao || t.descricaoTramitacao).kind;
                  const Icon = k === "aprovado" ? CheckCircle2 : k === "arquivado" ? Archive : k === "rejeitado" ? AlertCircle : k === "urgente" ? Gavel : Circle;
                  return (
                    <motion.li
                      key={`${t.sequencia}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                      className="relative flex gap-4 pb-5"
                    >
                      {i !== Math.min(tramitacoes.length, 12) - 1 && (
                        <span className="absolute left-[11px] top-7 h-[calc(100%-12px)] w-px bg-border" />
                      )}
                      <span className={"relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border " + statusBadgeClasses(k)}>
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold">{t.siglaOrgao || "Câmara"}</span>
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {(t.dataHora ?? "").slice(0, 10) || "—"}
                          </span>
                        </div>
                        {t.descricaoTramitacao && (
                          <p className="mt-0.5 text-sm text-foreground/90">{t.descricaoTramitacao}</p>
                        )}
                        {t.despacho && (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">{t.despacho}</p>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
          <Card>
            <CardHeader icon={<FileText className="h-4 w-4" />} title="Ficha do projeto" />
            <dl className="mt-4 space-y-2.5 text-sm">
              <Field label="Apresentação" value={p.dataApresentacao?.slice(0, 10) ?? "—"} />
              <Field label="Situação" value={p.statusProposicao?.descricaoSituacao ?? "—"} />
              <Field label="Tramitação" value={p.statusProposicao?.descricaoTramitacao ?? "—"} />
              <Field label="Órgão atual" value={p.statusProposicao?.siglaOrgao ?? "—"} />
            </dl>
          </Card>

          <Card>
            <CardHeader icon={<Users className="h-4 w-4" />} title="Quem propôs" />
            {autoresQ.isLoading ? (
              <div className="mt-4 h-20 animate-pulse rounded bg-secondary/40" />
            ) : autores.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">Autoria não disponível.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {autores.slice(0, 6).map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-lg border border-border bg-background/40 p-2.5">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.nome}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {[a.tipo, a.siglaPartido, a.siglaUf].filter(Boolean).join(" · ") || "Autoria oficial"}
                      </p>
                    </div>
                  </li>
                ))}
                {autores.length > 6 && (
                  <li className="text-[11px] text-muted-foreground">+{autores.length - 6} outros autores</li>
                )}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">{children}</div>;
}
function CardHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">{icon}</div>
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
