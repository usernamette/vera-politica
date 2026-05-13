import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/metodologia")({
  head: () => ({ meta: [{ title: "Metodologia — Brasil à Vera" }] }),
  component: Metodologia,
});

function Metodologia() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-1 text-sm">
          {[
            ["origem", "Origem dos dados"],
            ["atualizacao", "Atualização"],
            ["alinhamento", "Alinhamento partidário"],
            ["limitacoes", "Limitações"],
            ["transparencia", "Princípios"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <article className="prose prose-invert max-w-none">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Documentação</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Metodologia</h1>
        <p className="mt-3 text-muted-foreground">
          Como coletamos, processamos e exibimos os dados que você vê no Brasil à Vera.
        </p>

        <Section id="origem" title="Origem dos dados">
          Todos os dados exibidos são consultados diretamente da{" "}
          <a className="text-primary hover:underline" href="https://dadosabertos.camara.leg.br" target="_blank" rel="noreferrer">
            API de Dados Abertos da Câmara dos Deputados
          </a>. Não usamos intermediários, scraping ou bases não oficiais.
        </Section>
        <Section id="atualizacao" title="Atualização">
          Consultamos a API em tempo de execução, com cache curto para reduzir latência. Em geral, dados refletem o estado mais recente publicado pela Câmara, com defasagem máxima de algumas horas.
        </Section>
        <Section id="alinhamento" title="Alinhamento partidário">
          O alinhamento é calculado como a porcentagem de votos de um deputado que coincidem com a orientação majoritária do seu partido em votações nominais do plenário. Votações sem orientação registrada são excluídas do cálculo.
        </Section>
        <Section id="limitacoes" title="Limitações">
          Dados refletem apenas o que é publicado oficialmente. Mudanças tardias de partido, erros de registro de orientação e ausências justificadas podem distorcer pontualmente os indicadores. Sempre consulte a fonte oficial antes de tirar conclusões definitivas.
        </Section>
        <Section id="transparencia" title="Princípios de transparência">
          Não editorializamos. Não filtramos por viés. Mostramos dados brutos sempre que possível e explicamos cada cálculo derivado. Sugestões e correções são bem-vindas.
        </Section>
      </article>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
