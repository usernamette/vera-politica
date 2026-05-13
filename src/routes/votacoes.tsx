import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { camaraApi } from "@/lib/camara-api";
import { CheckCircle2, XCircle, Calendar } from "lucide-react";

export const Route = createFileRoute("/votacoes")({
  head: () => ({ meta: [{ title: "Votações — Brasil à Vera" }] }),
  component: VotacoesPage,
});

function VotacoesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["votacoes"],
    queryFn: () => camaraApi.listVotacoes({ itens: 40 }),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">Plenário e comissões</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Votações recentes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Decisões mais recentes registradas pela Câmara.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Órgão</th>
              <th className="px-4 py-3 text-left">Descrição</th>
              <th className="px-4 py-3 text-right">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={4} className="px-4 py-4"><div className="h-5 animate-pulse rounded bg-muted/40" /></td>
                  </tr>
                ))
              : (data?.dados ?? []).map((v) => (
                <tr key={v.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {v.data}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-primary">{v.siglaOrgao}</td>
                  <td className="px-4 py-3 max-w-xl"><p className="line-clamp-2">{v.descricao || "—"}</p></td>
                  <td className="px-4 py-3 text-right">
                    {v.aprovacao === 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3 w-3" /> Aprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                        <XCircle className="h-3 w-3" /> Rejeitado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
