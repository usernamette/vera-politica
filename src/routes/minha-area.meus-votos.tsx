import { createFileRoute, Link } from "@tanstack/react-router";
import { useFollowed } from "@/lib/user-store";
import { PartyBadge } from "@/components/site/PartyBadge";
import { ArrowRight, HelpCircle, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/minha-area/meus-votos")({
  head: () => ({ meta: [{ title: "Meus votos — Brasil à Vera" }] }),
  component: MeusVotosPage,
});

const perguntas = [
  "Ele participou das votações importantes?",
  "Apresentou propostas relevantes?",
  "Como usou a verba parlamentar?",
  "Votou de forma coerente com o que prometeu?",
  "Mudou de partido ou posição?",
];

function MeusVotosPage() {
  const voted = useFollowed("voted");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Políticos em quem votei</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Monitore se os representantes que você escolheu estão atuando de acordo com suas expectativas.
        </p>
      </header>

      {voted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <BadgeCheck className="h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-base font-semibold">Você ainda não marcou em quem votou.</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Marque em quem você votou para acompanhar o mandato ao longo do tempo.
          </p>
          <Link to="/parlamentares" className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            Buscar parlamentar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {voted.map((d) => (
            <article key={d.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={d.urlFoto} alt={d.nome} className="h-16 w-16 rounded-lg border border-border object-cover" />
                  <div>
                    <p className="font-semibold">{d.nome}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <PartyBadge sigla={d.siglaPartido} />
                      <span className="text-xs text-muted-foreground">· {d.siglaUf}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/parlamentares/$id"
                  params={{ id: String(d.id) }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
                >
                  Abrir perfil <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Atividade no ano", value: "Em análise" },
                  { label: "Votações importantes", value: "—" },
                  { label: "Gastos no ano", value: "—" },
                  { label: "Alinhamento com bancada", value: "—" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-secondary/30 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-sm font-semibold">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <HelpCircle className="h-3.5 w-3.5" /> Perguntas para acompanhar
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {perguntas.map((p) => (
                    <li key={p} className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
