import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, FileText, Gavel, ShieldCheck, Sparkles, Users, Wallet, Vote, Scale, Landmark, MapPin, Calendar, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brasil à Vera — Transparência política sem ruído" },
      { name: "description", content: "Acompanhe deputados, votações, gastos parlamentares e proposições com dados públicos oficiais da Câmara dos Deputados." },
    ],
  }),
  component: Home,
});

const stats = [
  { label: "Deputados federais", value: "513" },
  { label: "Proposições rastreadas", value: "+250k" },
  { label: "Votações analisadas", value: "+30k" },
  { label: "Atualização", value: "Diária" },
];

const features = [
  { icon: Users, title: "Perfis de parlamentares", desc: "Histórico completo de votos, alinhamento partidário e gastos detalhados." },
  { icon: Gavel, title: "Votações em tempo real", desc: "Acompanhe como cada deputado vota, com filtros e visualizações por partido e UF." },
  { icon: FileText, title: "Proposições legislativas", desc: "Busque, acompanhe e entenda PLs, PECs e medidas provisórias com clareza." },
  { icon: Wallet, title: "Gastos parlamentares", desc: "Cota parlamentar visualizada por categoria, fornecedor e ano." },
  { icon: BarChart3, title: "Análises agregadas", desc: "Rankings, mapas geográficos e padrões de comportamento legislativo." },
  { icon: ShieldCheck, title: "Dados oficiais", desc: "Conexão direta com a API da Câmara dos Deputados — sem intermediários." },
];

export default function Home() { return <Page />; }

function Item({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function Page() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" />
              Dados oficiais · Câmara dos Deputados
            </div>
            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight text-gradient md:text-7xl">
              Transparência política sem ruído.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
              Acompanhe deputados, votações, gastos parlamentares e proposições usando dados públicos oficiais — em uma interface que respeita seu tempo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/parlamentares"
                className="group inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                Explorar parlamentares
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/proposicoes"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-5 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-card"
              >
                Ver proposições
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-card p-6 text-center">
                <div className="text-2xl font-semibold tracking-tight md:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">O que você pode fazer</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Inteligência legislativa, sem rodeios
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tudo que você precisa para entender o Congresso: dados completos, contexto e visualizações limpas.
          </p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/60 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="group bg-card p-7 transition-colors hover:bg-surface-elevated"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EXPLAINER — QUEM FAZ O QUÊ */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Entenda em 1 minuto</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Quem faz o quê no Congresso?
          </h2>
          <p className="mt-3 text-muted-foreground">
            O Congresso Nacional tem duas casas. Cada uma com um papel diferente — mas as duas precisam concordar para uma lei valer.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Câmara dos Deputados */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Câmara dos Deputados</p>
                <h3 className="text-xl font-semibold">Deputados federais</h3>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Representam o <span className="font-medium text-foreground">povo de cada estado</span>. São 513 ao todo, eleitos a cada 4 anos. Quanto mais habitantes o estado tem, mais deputados ele elege.
            </p>

            <div className="mt-6 space-y-3">
              <Item icon={FileText} title="Propõem novas leis">
                A maioria dos projetos de lei nasce aqui — de saúde e educação a impostos.
              </Item>
              <Item icon={Vote} title="Votam o que vai virar lei">
                Antes de qualquer lei valer, a Câmara precisa aprovar o texto.
              </Item>
              <Item icon={Wallet} title="Aprovam o Orçamento da União">
                Decidem como o governo vai gastar o dinheiro dos seus impostos.
              </Item>
              <Item icon={Scale} title="Fiscalizam o governo">
                Podem abrir CPIs e pedir explicações de ministros e do presidente.
              </Item>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Representam o estado</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Mandato de 4 anos</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> 513 cadeiras</span>
            </div>

            <Link
              to="/parlamentares"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Ver os deputados <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Senado */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Senado Federal</p>
                <h3 className="text-xl font-semibold">Senadores</h3>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Representam <span className="font-medium text-foreground">cada estado em pé de igualdade</span>. São 81 — 3 por estado e mais 3 do Distrito Federal. O mandato é mais longo: 8 anos.
            </p>

            <div className="mt-6 space-y-3">
              <Item icon={CheckCircle2} title="Revisam as leis da Câmara">
                Quase tudo que a Câmara aprova passa pelo Senado para nova análise.
              </Item>
              <Item icon={Gavel} title="Julgam autoridades">
                É o Senado que julga o presidente em casos de impeachment.
              </Item>
              <Item icon={ShieldCheck} title="Aprovam nomes importantes">
                Ministros do STF, do TCU e embaixadores só assumem com o aval do Senado.
              </Item>
              <Item icon={Scale} title="Autorizam empréstimos do país">
                Decidem sobre dívida pública e tratados internacionais.
              </Item>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 3 por estado</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Mandato de 8 anos</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> 81 cadeiras</span>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Em breve: acompanhe também os senadores por aqui.
            </p>
          </motion.div>
        </div>

        {/* Como uma lei nasce */}
        <div className="mt-10 rounded-2xl border border-border bg-secondary/30 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Resumindo</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">Como uma lei nasce no Brasil</h3>
            </div>
            <p className="text-sm text-muted-foreground">Um caminho de 4 paradas, em linguagem simples.</p>
          </div>
          <ol className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ["1", "Proposta", "Um deputado, senador ou o governo apresenta um projeto."],
              ["2", "Câmara", "Os 513 deputados debatem, ajustam e votam o texto."],
              ["3", "Senado", "Os 81 senadores revisam. Se mudarem, volta para a Câmara."],
              ["4", "Sanção", "O presidente assina (ou veta). Aí sim, vira lei."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-xl border border-border bg-card p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-primary">{n}</div>
                <p className="mt-3 text-sm font-semibold">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>



      {/* TRANSPARENCY */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-10 md:grid-cols-2 md:p-14">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Compromisso</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Sem opinião. Sem viés. Apenas dados.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Nossas análises consultam diretamente a API oficial da Câmara dos Deputados. Mostramos a metodologia de cada cálculo e damos a você as ferramentas para tirar suas próprias conclusões.
            </p>
            <Link
              to="/metodologia"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Ver metodologia <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Fonte", "API Câmara"],
              ["Atualização", "Diária"],
              ["Histórico", "Legislatura atual"],
              ["Custo", "Gratuito"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-secondary/40 p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1.5 text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
