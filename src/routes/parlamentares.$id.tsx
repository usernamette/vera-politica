import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, ExternalLink, Mail, MapPin, ShieldCheck,
  Sparkles, ChevronDown, AlertCircle, Receipt, Users, GitCompareArrows,
  FileText, Vote as VoteIcon, GraduationCap, Cake, Building2, Globe,
  Wallet, Activity, TrendingUp, TrendingDown, Phone,
} from "lucide-react";
import { camaraApi } from "@/lib/camara-api";
import { PartyBadge } from "@/components/site/PartyBadge";
import { FollowActions } from "@/components/site/FollowActions";
import {
  Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area, CartesianGrid,
  PieChart, Pie,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parlamentares/$id")({
  component: PerfilPage,
  errorComponent: ErrorView,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Parlamentar não encontrado</h1>
      <Link to="/parlamentares" className="mt-4 inline-block text-primary hover:underline">Voltar para parlamentares</Link>
    </div>
  ),
});

function ErrorView({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Não foi possível carregar este parlamentar</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={() => router.invalidate()} className="mt-4 rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-sm hover:bg-secondary">
        Tentar novamente
      </button>
    </div>
  );
}

const RECENT_VOTACOES_TO_SCAN = 18;
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function PerfilPage() {
  const { id } = Route.useParams();
  const numericId = Number(id);

  const dep = useQuery({ queryKey: ["dep", id], queryFn: () => camaraApi.getDeputado(id), staleTime: 10 * 60_000 });
  const desp = useQuery({ queryKey: ["dep-despesas", id, new Date().getFullYear()], queryFn: () => camaraApi.getDespesas(id, new Date().getFullYear()), staleTime: 10 * 60_000 });
  const props = useQuery({ queryKey: ["dep-props", id], queryFn: () => camaraApi.getDeputadoProposicoes(id), staleTime: 10 * 60_000 });

  const votacoes = useQuery({
    queryKey: ["votacoes-recent", RECENT_VOTACOES_TO_SCAN],
    queryFn: () => camaraApi.listVotacoes({ itens: RECENT_VOTACOES_TO_SCAN }),
    staleTime: 5 * 60_000,
  });

  const votacaoIds = (votacoes.data?.dados ?? []).map((v) => v.id);

  const votosQueries = useQueries({
    queries: votacaoIds.map((vid) => ({
      queryKey: ["votos", vid],
      queryFn: () => camaraApi.getVotacaoVotos(vid),
      staleTime: 10 * 60_000,
    })),
  });

  const orientacoesQueries = useQueries({
    queries: votacaoIds.map((vid) => ({
      queryKey: ["orient", vid],
      queryFn: () => camaraApi.getVotacaoOrientacoes(vid),
      staleTime: 10 * 60_000,
    })),
  });

  const partyOfDep = dep.data?.dados.ultimoStatus.siglaPartido;

  const myVotes = useMemo(() => {
    type VoteRow = {
      votacao: { id: string; data: string; dataHoraRegistro: string; siglaOrgao: string; descricao: string; aprovacao: number };
      voto: string;
      totals: { Sim: number; "Não": number; "Abstenção": number; Outros: number; Total: number };
      partyOrientacao?: string;
    };
    const list: VoteRow[] = [];
    (votacoes.data?.dados ?? []).forEach((v, idx) => {
      const votosRes = votosQueries[idx]?.data;
      if (!votosRes) return;
      const mine = votosRes.dados.find((d) => d.deputado_.id === numericId);
      if (!mine) return;
      const totals = { Sim: 0, "Não": 0, "Abstenção": 0, Outros: 0, Total: votosRes.dados.length };
      for (const r of votosRes.dados) {
        const tv = (r.tipoVoto || "").trim();
        if (tv === "Sim") totals.Sim++;
        else if (tv === "Não") totals["Não"]++;
        else if (tv === "Abstenção") totals["Abstenção"]++;
        else totals.Outros++;
      }
      const orientRes = orientacoesQueries[idx]?.data;
      const partyOrientacao = orientRes?.dados.find((o) => o.siglaPartidoBloco === partyOfDep)?.orientacaoVoto;
      list.push({ votacao: v as any, voto: mine.tipoVoto, totals, partyOrientacao });
    });
    return list;
  }, [votacoes.data, votosQueries.map((q) => q.dataUpdatedAt).join(","), orientacoesQueries.map((q) => q.dataUpdatedAt).join(","), numericId, partyOfDep]);

  const alignment = useMemo(() => {
    let comparable = 0, agree = 0;
    for (const m of myVotes) {
      if (!m.partyOrientacao) continue;
      const o = m.partyOrientacao.toLowerCase();
      if (!["sim", "não", "nao"].includes(o)) continue;
      const orient = o === "nao" ? "Não" : o.charAt(0).toUpperCase() + o.slice(1);
      if (m.voto === "Sim" || m.voto === "Não") {
        comparable++;
        if (m.voto === orient) agree++;
      }
    }
    return { comparable, agree, pct: comparable > 0 ? Math.round((agree / comparable) * 100) : null };
  }, [myVotes]);

  // Vote profile: own Sim/Não/Abstenção breakdown across recent
  const profile = useMemo(() => {
    const c = { Sim: 0, "Não": 0, "Abstenção": 0, Outros: 0 };
    for (const m of myVotes) {
      const v = (m.voto || "").trim();
      if (v === "Sim") c.Sim++;
      else if (v === "Não") c["Não"]++;
      else if (v === "Abstenção") c["Abstenção"]++;
      else c.Outros++;
    }
    const total = c.Sim + c["Não"] + c["Abstenção"] + c.Outros;
    return { ...c, total };
  }, [myVotes]);

  const affinity = useMemo(() => {
    const counter = new Map<number, { name: string; party: string; uf: string; foto: string; matches: number; total: number }>();
    (votacoes.data?.dados ?? []).forEach((_v, idx) => {
      const votosRes = votosQueries[idx]?.data;
      if (!votosRes) return;
      const mine = votosRes.dados.find((d) => d.deputado_.id === numericId);
      if (!mine) return;
      for (const r of votosRes.dados) {
        if (r.deputado_.id === numericId) continue;
        const k = r.deputado_.id;
        const cur = counter.get(k) ?? { name: r.deputado_.nome, party: r.deputado_.siglaPartido, uf: r.deputado_.siglaUf, foto: r.deputado_.urlFoto, matches: 0, total: 0 };
        cur.total++;
        if (r.tipoVoto === mine.tipoVoto) cur.matches++;
        counter.set(k, cur);
      }
    });
    return Array.from(counter.entries())
      .map(([id, v]) => ({ id, ...v, pct: v.total > 0 ? Math.round((v.matches / v.total) * 100) : 0 }))
      .filter((x) => x.total >= 3)
      .sort((a, b) => b.pct - a.pct || b.matches - a.matches)
      .slice(0, 5);
  }, [votacoes.data, votosQueries.map((q) => q.dataUpdatedAt).join(","), numericId]);

  // Expenses
  const totalDesp = useMemo(() => (desp.data?.dados ?? []).reduce((s, d) => s + (d.valorLiquido || 0), 0), [desp.data]);
  const porCategoria = useMemo(() => {
    const m = new Map<string, { valor: number; count: number }>();
    for (const d of desp.data?.dados ?? []) {
      const cur = m.get(d.tipoDespesa) ?? { valor: 0, count: 0 };
      cur.valor += d.valorLiquido; cur.count++;
      m.set(d.tipoDespesa, cur);
    }
    return Array.from(m.entries())
      .map(([categoria, v]) => ({ categoria, valor: v.valor, count: v.count, short: categoria.length > 32 ? categoria.slice(0, 32) + "…" : categoria }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);
  }, [desp.data]);

  const porMes = useMemo(() => {
    const arr = MESES.map((m, i) => ({ mes: m, idx: i + 1, valor: 0 }));
    for (const d of desp.data?.dados ?? []) {
      const i = (d.mes ?? 1) - 1;
      if (i >= 0 && i < 12) arr[i].valor += d.valorLiquido || 0;
    }
    const now = new Date().getMonth();
    return arr.slice(0, now + 1);
  }, [desp.data]);

  const trend = useMemo(() => {
    if (porMes.length < 2) return null;
    const last = porMes[porMes.length - 1].valor;
    const prev = porMes[porMes.length - 2].valor;
    if (prev === 0) return null;
    const pct = Math.round(((last - prev) / prev) * 100);
    return { pct, up: pct >= 0 };
  }, [porMes]);

  if (dep.isLoading) return <PageSkeleton />;
  if (dep.isError || !dep.data) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-muted-foreground">Não foi possível carregar este parlamentar.</div>;
  }

  const d = dep.data.dados;
  const s = d.ultimoStatus;
  const votosLoading = votacoes.isLoading || votosQueries.some((q) => q.isLoading);
  const idade = d.dataNascimento ? calcAge(d.dataNascimento) : null;
  const naturalidade = [d.municipioNascimento, d.ufNascimento].filter(Boolean).join(" / ");

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-8">
      {/* Breadcrumb + back */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/parlamentares" className="transition-colors hover:text-foreground">Parlamentares</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{s.nome}</span>
      </nav>
      <Link to="/parlamentares" className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* HERO */}
      <Reveal delay={0}>
        <section className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          {/* Cover */}
          <div className="relative h-40 overflow-hidden md:h-48">
            <div className="absolute inset-0 bg-gradient-primary opacity-40" />
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, oklch(0.85 0.18 220 / 0.6) 0, transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.75 0.2 280 / 0.5) 0, transparent 45%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "linear-gradient(to bottom, black, transparent)",
              }}
            />
          </div>

          <div className="grid gap-6 px-6 pb-6 md:grid-cols-[auto_1fr_auto] md:gap-8 md:px-8 md:pb-8">
            <img
              src={s.urlFoto}
              alt={s.nome}
              className="-mt-24 h-36 w-36 rounded-2xl border-4 border-card object-cover shadow-glow md:h-40 md:w-40"
            />
            <div className="min-w-0 md:pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <DataBadge level="L1" />
                <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> {s.situacao}
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{s.nome}</h1>
              <p className="text-sm text-muted-foreground">{d.nomeCivil}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                <PartyBadge sigla={s.siglaPartido} />
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {s.siglaUf}
                </span>
                <Dot />
                <span className="text-muted-foreground">Deputado(a) Federal</span>
                <Dot />
                <span className="text-muted-foreground">57ª Legislatura</span>
              </div>

              {/* Bio chips */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {idade !== null && <BioChip icon={<Cake className="h-3 w-3" />}>{idade} anos</BioChip>}
                {naturalidade && <BioChip icon={<MapPin className="h-3 w-3" />}>{naturalidade}</BioChip>}
                {d.escolaridade && <BioChip icon={<GraduationCap className="h-3 w-3" />}>{d.escolaridade}</BioChip>}
                {s.gabinete?.predio && (
                  <BioChip icon={<Building2 className="h-3 w-3" />}>
                    Gab. {s.gabinete.sala ? `${s.gabinete.sala}, ` : ""}prédio {s.gabinete.predio}
                  </BioChip>
                )}
                {s.gabinete?.telefone && <BioChip icon={<Phone className="h-3 w-3" />}>{s.gabinete.telefone}</BioChip>}
              </div>

              <div className="mt-5">
                <FollowActions
                  deputado={{ id: d.id, nome: s.nome, siglaPartido: s.siglaPartido, siglaUf: s.siglaUf, urlFoto: s.urlFoto }}
                  size="md"
                  variant="full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs md:items-end md:pt-3">
              <Field label="Casa" value="Câmara dos Deputados" />
              <Field label="Condição" value={s.condicaoEleitoral} />
              {s.email && (
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 transition-colors hover:bg-secondary">
                  <Mail className="h-3.5 w-3.5" /> <span className="max-w-[180px] truncate">{s.email}</span>
                </a>
              )}
              {d.urlWebsite && (
                <a href={d.urlWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 transition-colors hover:bg-secondary">
                  <Globe className="h-3.5 w-3.5" /> Site oficial
                </a>
              )}
              <a
                href={`https://www.camara.leg.br/deputados/${d.id}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary transition-colors hover:bg-primary/20"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Fonte oficial
              </a>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-px border-t border-border bg-border md:grid-cols-4">
            <HeroKPI
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Alinhamento à bancada"
              value={alignment.pct === null ? "—" : `${alignment.pct}%`}
              hint={alignment.pct === null ? "Sem base" : `${alignment.agree}/${alignment.comparable} votos`}
              loading={votosLoading}
            />
            <HeroKPI
              icon={<VoteIcon className="h-3.5 w-3.5" />}
              label="Votos analisados"
              value={profile.total.toString()}
              hint={`Sim ${profile.Sim} · Não ${profile["Não"]} · Abst. ${profile["Abstenção"]}`}
              loading={votosLoading}
            />
            <HeroKPI
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Proposições"
              value={(props.data?.dados?.length ?? 0).toString()}
              hint="Como autor(a) ou coautor(a)"
              loading={props.isLoading}
            />
            <HeroKPI
              icon={<Wallet className="h-3.5 w-3.5" />}
              label={`Gastos em ${new Date().getFullYear()}`}
              value={formatCurrency(totalDesp)}
              hint={trend ? (trend.up ? `▲ ${trend.pct}% vs mês anterior` : `▼ ${Math.abs(trend.pct)}% vs mês anterior`) : "Cota CEAP"}
              hintTone={trend ? (trend.up ? "warn" : "ok") : "muted"}
              loading={desp.isLoading}
            />
          </div>
        </section>
      </Reveal>

      {/* SECTION NAV */}
      <SectionNav />

      {/* RECENT VOTES */}
      <Reveal delay={0.05}>
        <SectionCard
          id="votos"
          icon={<VoteIcon className="h-4 w-4" />}
          title="Votos recentes"
          subtitle="Apenas votações nominais com voto individual registrado."
          badge={<DataBadge level="L1" />}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              {votosLoading ? (
                <SkeletonList rows={5} />
              ) : myVotes.length === 0 ? (
                <Empty>Nenhum voto nominal encontrado para este parlamentar.</Empty>
              ) : (
                <ul className="divide-y divide-border/60">
                  {myVotes.slice(0, 8).map((m, i) => (
                    <li key={i} className="-mx-2 flex items-start gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/30">
                      <div className="w-20 shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {formatDate((m.votacao as any).data)}
                        <div className="mt-0.5 text-foreground/70">{(m.votacao as any).siglaOrgao}</div>
                      </div>
                      <VoteBadge voto={m.voto} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-foreground/90">{(m.votacao as any).descricao}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span><b className="text-emerald-400">{m.totals.Sim}</b> Sim</span>
                          <span><b className="text-rose-400">{m.totals["Não"]}</b> Não</span>
                          <span><b className="text-amber-400">{m.totals["Abstenção"]}</b> Abstenção</span>
                          <span>· Total {m.totals.Total}</span>
                          {m.partyOrientacao && (
                            <span>
                              · Orientação {s.siglaPartido}: <b className="text-foreground/80">{m.partyOrientacao}</b>
                              {isDivergent(m.voto, m.partyOrientacao) && (
                                <span className="ml-1 inline-flex items-center gap-1 rounded border border-warning/30 bg-warning/10 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning">divergiu</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Vote profile donut */}
            <aside className="rounded-xl border border-border bg-secondary/20 p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Perfil de voto</p>
              <p className="mt-0.5 text-xs text-foreground/80">Distribuição nas {myVotes.length} votações analisadas</p>
              {profile.total === 0 ? (
                <div className="mt-6 text-center text-xs text-muted-foreground">Sem dados ainda.</div>
              ) : (
                <>
                  <div className="relative mx-auto mt-3 h-40 w-40">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Sim", value: profile.Sim, color: "oklch(0.72 0.18 145)" },
                            { name: "Não", value: profile["Não"], color: "oklch(0.66 0.22 25)" },
                            { name: "Abstenção", value: profile["Abstenção"], color: "oklch(0.78 0.16 75)" },
                            { name: "Outros", value: profile.Outros, color: "oklch(0.5 0.02 260)" },
                          ]}
                          dataKey="value"
                          innerRadius="65%"
                          outerRadius="100%"
                          paddingAngle={2}
                          stroke="oklch(0.18 0.014 260)"
                          strokeWidth={2}
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <Cell key={i} fill={["oklch(0.72 0.18 145)", "oklch(0.66 0.22 25)", "oklch(0.78 0.16 75)", "oklch(0.5 0.02 260)"][i]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-semibold tabular-nums">{profile.total}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">votos</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    <LegendRow color="oklch(0.72 0.18 145)" label="Sim" value={profile.Sim} total={profile.total} />
                    <LegendRow color="oklch(0.66 0.22 25)" label="Não" value={profile["Não"]} total={profile.total} />
                    <LegendRow color="oklch(0.78 0.16 75)" label="Abstenção" value={profile["Abstenção"]} total={profile.total} />
                    {profile.Outros > 0 && <LegendRow color="oklch(0.5 0.02 260)" label="Outros" value={profile.Outros} total={profile.total} />}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </SectionCard>
      </Reveal>

      {/* TWO COLUMN: ALIGNMENT + AFFINITY */}
      <div id="alinhamento" className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Reveal delay={0.1}>
          <SectionCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Alinhamento à bancada"
            subtitle="% de votos que coincidem com a orientação do partido."
            badge={<DataBadge level="L2" />}
            inline
          >
            <p className="mb-4 text-xs text-muted-foreground">
              Mede a fidelidade prática à liderança partidária — não compromisso ideológico.
            </p>
            {votosLoading ? (
              <div className="h-48 animate-pulse rounded-lg bg-muted/30" />
            ) : alignment.pct === null ? (
              <Empty>Sem votações comparáveis com orientação registrada.</Empty>
            ) : (
              <div className="flex items-center gap-6">
                <div className="relative h-40 w-40 shrink-0">
                  <ResponsiveContainer>
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "a", value: alignment.pct, fill: alignmentColor(alignment.pct) }]} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background={{ fill: "oklch(0.22 0.014 260)" }} dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold tracking-tight">{alignment.pct}%</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">alinhamento</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <b className="text-foreground">{alignment.agree}</b> de <b className="text-foreground">{alignment.comparable}</b> votos coincidiram com a orientação <PartyBadge sigla={s.siglaPartido} className="ml-1" />
                  </p>
                  <p className="mt-2 text-xs">Base: últimas {votacaoIds.length} votações nominais do plenário.</p>
                  <p className="mt-3 text-xs">{alignmentLabel(alignment.pct)}</p>
                </div>
              </div>
            )}
          </SectionCard>
        </Reveal>

        <Reveal delay={0.15}>
          <SectionCard
            icon={<Users className="h-4 w-4" />}
            title="Top 5 maior afinidade de voto"
            subtitle="Outros parlamentares que mais coincidem no voto."
            badge={<DataBadge level="L2" />}
            inline
          >
            <p className="mb-3 text-xs text-muted-foreground">Mostra concordância prática, não alinhamento ideológico declarado.</p>
            {votosLoading ? (
              <SkeletonList rows={5} />
            ) : affinity.length === 0 ? (
              <Empty>Sem dados suficientes para calcular afinidade.</Empty>
            ) : (
              <ol className="space-y-2">
                {affinity.map((a, i) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5 transition-colors hover:border-primary/40 hover:bg-secondary/60">
                    <span className="w-5 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                    <img src={a.foto} alt={a.name} className="h-9 w-9 rounded-full border border-border object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to="/parlamentares/$id" params={{ id: String(a.id) }} className="block truncate text-sm font-medium hover:text-primary">{a.name}</Link>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <PartyBadge sigla={a.party} /> <span>· {a.uf}</span>
                      </div>
                    </div>
                    <div className="min-w-[120px] max-w-[140px]">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-base font-semibold tabular-nums text-primary">{a.pct}%</div>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
                        <div className="h-full bg-gradient-primary" style={{ width: `${a.pct}%` }} />
                      </div>
                      <div className="mt-0.5 text-right text-[10px] text-muted-foreground">{a.matches}/{a.total} votos</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <Disclosure label="Como é calculado">
              Comparamos os votos deste parlamentar nas últimas {votacaoIds.length} votações nominais com os votos de cada outro deputado nas mesmas votações. A porcentagem é a fração de coincidências sobre o total de votações em que ambos estiveram presentes (mínimo 3).
            </Disclosure>
          </SectionCard>
        </Reveal>
      </div>

      {/* OPPOSITE PAIRS */}
      <Reveal delay={0.2}>
        <SectionCard
          icon={<GitCompareArrows className="h-4 w-4" />}
          title="Pares de votos em direções opostas"
          subtitle="Mesmo tema, direções inversas, voto idêntico."
          badge={<DataBadge level="L2" />}
        >
          <p className="mb-4 text-xs text-muted-foreground">A plataforma espelha o dado — o cidadão tira a conclusão.</p>
          <Empty>Nenhum par contraditório detectado para este parlamentar com a base atual.</Empty>
          <div className="mt-4 rounded-lg border border-border/60 bg-secondary/20 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" /> Possíveis razões
            </div>
            <ul className="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
              <li>• Votação não vinculada à proposição</li>
              <li>• Ementa não classificada</li>
              <li>• Tema em comum obrigatório</li>
              <li>• Cobertura histórica ainda incompleta</li>
            </ul>
          </div>
        </SectionCard>
      </Reveal>

      {/* AUTHORSHIP */}
      <Reveal delay={0.25}>
        <SectionCard
          id="proposicoes"
          icon={<FileText className="h-4 w-4" />}
          title="Proposições onde é autor ou coautor"
          subtitle="Iniciativas legislativas vinculadas a este parlamentar."
          badge={<DataBadge level="L1" />}
        >
          {props.isLoading ? (
            <SkeletonList rows={4} />
          ) : (props.data?.dados ?? []).length === 0 ? (
            <Empty>Sem proposições onde este parlamentar consta como autor ou coautor na base atual.</Empty>
          ) : (
            <div className="grid gap-2">
              {(props.data?.dados ?? []).slice(0, 10).map((p) => (
                <Link
                  key={p.id}
                  to="/proposicoes/$id"
                  params={{ id: String(p.id) }}
                  className="group flex items-start justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{p.siglaTipo} {p.numero}/{p.ano}</span>
                      <span className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Autor</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-foreground/90">{p.ementa}</p>
                  </div>
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </Reveal>

      {/* EXPENSES */}
      <Reveal delay={0.3}>
        <SectionCard
          id="gastos"
          icon={<Receipt className="h-4 w-4" />}
          title={`Gastos parlamentares — ${new Date().getFullYear()}`}
          subtitle="Cota para o Exercício da Atividade Parlamentar (CEAP)."
          badge={<DataBadge level="L1" />}
        >
          {desp.isLoading ? (
            <div className="h-72 animate-pulse rounded-lg bg-muted/30" />
          ) : (desp.data?.dados ?? []).length === 0 ? (
            <Empty>Sem dados de despesa para o ano corrente.</Empty>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <KPI label="Total no ano" value={formatCurrency(totalDesp)} accent="text-primary" />
                <KPI label="Média mensal" value={formatCurrency(porMes.length ? totalDesp / porMes.length : 0)} />
                <KPI label="Despesas registradas" value={(desp.data?.dados.length ?? 0).toString()} />
                <KPI label="Categorias" value={porCategoria.length.toString()} />
              </div>

              {/* Monthly trend */}
              <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground/80 inline-flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" /> Evolução mensal
                  </p>
                  {trend && (
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                      trend.up ? "border-warning/30 bg-warning/10 text-warning" : "border-success/30 bg-success/10 text-success"
                    )}>
                      {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {trend.up ? "+" : ""}{trend.pct}% vs mês anterior
                    </span>
                  )}
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={porMes} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.72 0.19 260)" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="oklch(0.72 0.19 260)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                      <XAxis dataKey="mes" stroke="oklch(0.66 0.018 260)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.66 0.018 260)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={50} />
                      <Tooltip
                        cursor={{ stroke: "oklch(0.72 0.19 260)", strokeOpacity: 0.4 }}
                        contentStyle={{ background: "oklch(0.18 0.014 260)", border: "1px solid oklch(1 0 0 / 0.08)", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => formatCurrency(v)}
                      />
                      <Area type="monotone" dataKey="valor" stroke="oklch(0.72 0.19 260)" strokeWidth={2} fill="url(#gExp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                <p className="mb-2 text-xs font-semibold text-foreground/80">Top categorias</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porCategoria.map((c) => ({ ...c, categoria: c.short }))} layout="vertical" margin={{ left: 16, right: 16 }}>
                      <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} stroke="oklch(0.66 0.018 260)" fontSize={11} />
                      <YAxis type="category" dataKey="categoria" stroke="oklch(0.66 0.018 260)" fontSize={11} width={200} />
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
                </div>
              </div>
            </>
          )}
        </SectionCard>
      </Reveal>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function SectionCard({
  icon, title, subtitle, badge, children, id, inline,
}: { icon: React.ReactNode; title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode; id?: string; inline?: boolean }) {
  return (
    <section id={id} className={cn("rounded-2xl border border-border bg-card p-6 shadow-soft scroll-mt-24", inline ? "h-full" : "mt-6")}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="text-primary">{icon}</span> {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {badge}
      </header>
      {children}
    </section>
  );
}

function VoteBadge({ voto }: { voto: string }) {
  const v = (voto || "").trim();
  const map: Record<string, { bg: string; border: string; fg: string; label: string }> = {
    "Sim": { bg: "bg-emerald-500/15", border: "border-emerald-500/30", fg: "text-emerald-300", label: "SIM" },
    "Não": { bg: "bg-rose-500/15", border: "border-rose-500/30", fg: "text-rose-300", label: "NÃO" },
    "Abstenção": { bg: "bg-amber-500/15", border: "border-amber-500/30", fg: "text-amber-300", label: "ABSTENÇÃO" },
  };
  const cfg = map[v] ?? { bg: "bg-secondary/60", border: "border-border", fg: "text-muted-foreground", label: v.toUpperCase() || "—" };
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center rounded-md border px-2 text-[10px] font-bold tracking-wider", cfg.bg, cfg.border, cfg.fg)}>
      {cfg.label}
    </span>
  );
}

function DataBadge({ level }: { level: "L1" | "L2" }) {
  const cfg = level === "L1"
    ? { label: "L1 — Fonte oficial verificada", icon: <ShieldCheck className="h-3 w-3" />, cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" }
    : { label: "L2 — Dados agregados verificáveis", icon: <Sparkles className="h-3 w-3" />, cls: "border-sky-500/30 bg-sky-500/10 text-sky-300" };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", cfg.cls)}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground/90">{value}</div>
    </div>
  );
}

function Dot() { return <span className="text-muted-foreground/50">·</span>; }

function BioChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="text-foreground/80">{children}</span>
    </span>
  );
}

function HeroKPI({ icon, label, value, hint, hintTone = "muted", loading }: {
  icon: React.ReactNode; label: string; value: string; hint?: string; hintTone?: "muted" | "ok" | "warn"; loading?: boolean;
}) {
  const toneCls = hintTone === "ok" ? "text-success" : hintTone === "warn" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="bg-card p-4 transition-colors hover:bg-secondary/30">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      {loading ? (
        <div className="mt-2 h-7 w-24 animate-pulse rounded bg-muted/30" />
      ) : (
        <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      )}
      {hint && <div className={cn("mt-0.5 text-[11px]", toneCls)}>{hint}</div>}
    </div>
  );
}

function SectionNav() {
  const items = [
    { id: "votos", label: "Votos" },
    { id: "alinhamento", label: "Alinhamento" },
    { id: "proposicoes", label: "Proposições" },
    { id: "gastos", label: "Gastos" },
  ];
  const [active, setActive] = useState<string>("votos");
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140;
      let cur = items[0].id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.offsetTop <= y) cur = it.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="sticky top-16 z-20 mt-6 -mx-2 flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card/80 p-1 backdrop-blur">
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            active === it.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          {it.label}
        </a>
      ))}
    </div>
  );
}

function LegendRow({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span className="flex-1 text-foreground/80">{label}</span>
      <span className="tabular-nums text-muted-foreground">{value} · {pct}%</span>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function SkeletonList({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/30" />
      ))}
    </div>
  );
}

function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-secondary/20">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
        <span>{label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">{children}</div>}
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tracking-tight tabular-nums", accent)}>{value}</div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="h-72 animate-pulse rounded-3xl border border-border bg-card" />
      <div className="mt-6 h-72 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function calcAge(iso: string) {
  const b = new Date(iso);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a;
}

function alignmentColor(pct: number) {
  if (pct >= 85) return "oklch(0.72 0.19 145)";
  if (pct >= 60) return "oklch(0.78 0.16 75)";
  return "oklch(0.66 0.22 25)";
}

function alignmentLabel(pct: number) {
  if (pct >= 90) return "Alinhamento muito alto com a bancada.";
  if (pct >= 75) return "Alinhamento alto, dentro do padrão da liderança.";
  if (pct >= 50) return "Alinhamento moderado — diverge em pautas pontuais.";
  return "Alinhamento baixo — divergência frequente da liderança.";
}

function isDivergent(voto: string, orient?: string) {
  if (!orient) return false;
  const o = orient.toLowerCase();
  if (!["sim", "não", "nao"].includes(o)) return false;
  const norm = o === "nao" ? "Não" : o.charAt(0).toUpperCase() + o.slice(1);
  return (voto === "Sim" || voto === "Não") && voto !== norm;
}
