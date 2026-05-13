import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { camaraApi } from "@/lib/camara-api";

export const Route = createFileRoute("/proposicoes/$id")({
  component: PropDetail,
});

function PropDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["prop", id],
    queryFn: () => camaraApi.getProposicao(id),
    staleTime: 10 * 60_000,
  });

  if (isLoading) return <div className="mx-auto max-w-4xl px-6 py-16"><div className="h-64 animate-pulse rounded-xl border border-border bg-card" /></div>;
  if (isError || !data) return <div className="mx-auto max-w-4xl px-6 py-16 text-muted-foreground">Não foi possível carregar esta proposição.</div>;

  const p = data.dados;
  const status = p.statusProposicao || {};

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/proposicoes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">{p.siglaTipo} {p.numero}/{p.ano}</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{p.ementa}</h1>
        {p.ementaDetalhada && <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.ementaDetalhada}</p>}

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Field label="Apresentação" value={p.dataApresentacao?.slice(0, 10) ?? "—"} />
          <Field label="Situação" value={status.descricaoSituacao ?? "—"} />
          <Field label="Tramitação" value={status.descricaoTramitacao ?? "—"} />
          <Field label="Órgão" value={status.siglaOrgao ?? "—"} />
        </div>

        {p.keywords && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Palavras-chave</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.keywords.split(",").slice(0, 14).map((k, i) => (
                <span key={i} className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground">
                  {k.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <a
          href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`}
          target="_blank" rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Ver na Câmara <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
