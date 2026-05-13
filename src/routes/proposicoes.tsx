import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { camaraApi } from "@/lib/camara-api";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/proposicoes")({
  head: () => ({ meta: [{ title: "Proposições — Brasil à Vera" }] }),
  component: ProposicoesPage,
});

function ProposicoesPage() {
  const [tipo, setTipo] = useState("PL");
  const [ano, setAno] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ["proposicoes", tipo, ano],
    queryFn: () => camaraApi.listProposicoes({ siglaTipo: tipo || undefined, ano, itens: 30 }),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Atividade legislativa</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Proposições</h1>
      <p className="mt-1 text-sm text-muted-foreground">PLs, PECs e outras proposições em tramitação.</p>

      <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          className="h-10 rounded-md border border-border bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40">
          {["PL","PEC","PLP","MPV","PDC","PRC"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="number" value={ano} min={2000} max={new Date().getFullYear()}
          onChange={(e) => setAno(Number(e.target.value))}
          className="h-10 w-32 rounded-md border border-border bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="mt-6 grid gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />)
          : (data?.dados ?? []).map((p) => (
            <Link
              key={p.id}
              to="/proposicoes/$id"
              params={{ id: String(p.id) }}
              className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-glow"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-primary">{p.siglaTipo} {p.numero}/{p.ano}</div>
                  <p className="mt-1 line-clamp-2 text-sm">{p.ementa}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
