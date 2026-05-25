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
