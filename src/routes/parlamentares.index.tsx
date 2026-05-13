import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Loader2, Download } from "lucide-react";
import { camaraApi, UFS } from "@/lib/camara-api";
import { ParliamentCard } from "@/components/site/ParliamentCard";

export const Route = createFileRoute("/parlamentares/")({
  head: () => ({
    meta: [
      { title: "Parlamentares — Brasil à Vera" },
      { name: "description", content: "Explore os 513 deputados federais com filtros por partido, UF e nome." },
    ],
  }),
  component: ParlamentaresPage,
});

function ParlamentaresPage() {
  const [nome, setNome] = useState("");
  const [uf, setUf] = useState("");
  const [partido, setPartido] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["deputados", { uf, partido }],
    queryFn: () => camaraApi.listDeputados({ siglaUf: uf || undefined, siglaPartido: partido || undefined, itens: 100 }),
    staleTime: 5 * 60_000,
  });

  const partidos = useMemo(() => {
    const s = new Set((data?.dados ?? []).map((d) => d.siglaPartido));
    return Array.from(s).sort();
  }, [data]);

  const filtrados = useMemo(() => {
    const list = data?.dados ?? [];
    const q = nome.trim().toLowerCase();
    return q ? list.filter((d) => d.nome.toLowerCase().includes(q)) : list;
  }, [data, nome]);

  const exportCSV = () => {
    const rows = [["Nome", "Partido", "UF", "ID"], ...filtrados.map((d) => [d.nome, d.siglaPartido, d.siglaUf, d.id])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "parlamentares.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Câmara dos Deputados</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Parlamentares</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : `${filtrados.length} resultado(s)`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={isLoading || filtrados.length === 0}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 mt-6 -mx-2 rounded-xl border border-border bg-background/80 p-3 backdrop-blur-xl shadow-soft">
        <div className="grid gap-2 md:grid-cols-[1fr_140px_140px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Buscar por nome..."
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </div>
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todas as UFs</option>
            {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select
            value={partido}
            onChange={(e) => setPartido(e.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos os partidos</option>
            {partidos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[110px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-12 rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive-foreground">
          Não foi possível carregar os dados da Câmara. Tente novamente.
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((d, i) => <ParliamentCard key={d.id} deputado={d} index={i} />)}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-16 text-center">
      <Loader2 className="h-8 w-8 text-muted-foreground" />
      <p className="mt-4 font-semibold">Nenhum parlamentar encontrado</p>
      <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros para refinar sua busca.</p>
    </div>
  );
}
