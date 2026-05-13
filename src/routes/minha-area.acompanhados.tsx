import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Trash2, ArrowRight } from "lucide-react";
import { useFollowed, followStore } from "@/lib/user-store";
import { PartyBadge } from "@/components/site/PartyBadge";

export const Route = createFileRoute("/minha-area/acompanhados")({
  head: () => ({ meta: [{ title: "Acompanhados — Brasil à Vera" }] }),
  component: AcompanhadosPage,
});

function AcompanhadosPage() {
  const [tab, setTab] = useState<"voted" | "favorite">("voted");
  const voted = useFollowed("voted");
  const favs = useFollowed("favorite");
  const list = tab === "voted" ? voted : favs;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Políticos acompanhados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Veja todos os parlamentares que você favoritou ou marcou como alguém em quem votou.
        </p>
      </header>

      <div className="inline-flex rounded-lg border border-border bg-card p-1">
        {[
          { id: "voted", label: `Votei neles (${voted.length})`, icon: BadgeCheck },
          { id: "favorite", label: `Favoritos (${favs.length})`, icon: Star },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
              tab === t.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <p className="text-base font-semibold">
            {tab === "voted" ? "Você ainda não marcou em quem votou." : "Você ainda não favoritou nenhum político."}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {tab === "voted"
              ? "Marque seus representantes para acompanhar como eles atuam ao longo do mandato."
              : "Favorite parlamentares que você quer fiscalizar de perto."}
          </p>
          <Link to="/parlamentares" className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            {tab === "voted" ? "Buscar parlamentar" : "Explorar parlamentares"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <img src={d.urlFoto} alt={d.nome} className="h-16 w-16 rounded-lg border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.nome}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <PartyBadge sigla={d.siglaPartido} />
                    <span className="text-[11px] text-muted-foreground">· {d.siglaUf}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Deputado(a) Federal</p>
                </div>
                <RelationBadge kind={tab} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <Stat label="Votos no ano" value="—" />
                <Stat label="Proposições" value="—" />
                <Stat label="Gastos no ano" value="—" />
                <Stat label="Presença" value="—" />
              </dl>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Adicionado em {new Date(d.addedAt).toLocaleDateString("pt-BR")}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  to="/parlamentares/$id"
                  params={{ id: String(d.id) }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                >
                  Ver perfil <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => followStore.remove(tab, d.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function RelationBadge({ kind }: { kind: "voted" | "favorite" }) {
  return kind === "voted" ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-success/40 bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
      <BadgeCheck className="h-3 w-3" /> Votei nele
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-warning/40 bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
      <Star className="h-3 w-3 fill-current" /> Favorito
    </span>
  );
}
