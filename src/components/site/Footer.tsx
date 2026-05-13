import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold">Brasil à Vera</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Inteligência legislativa e transparência política a partir de dados públicos oficiais da Câmara dos Deputados.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Plataforma</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/parlamentares" className="hover:text-foreground text-muted-foreground">Parlamentares</Link></li>
            <li><Link to="/proposicoes" className="hover:text-foreground text-muted-foreground">Proposições</Link></li>
            <li><Link to="/votacoes" className="hover:text-foreground text-muted-foreground">Votações</Link></li>
            <li><Link to="/analise" className="hover:text-foreground text-muted-foreground">Análises</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Sobre</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/metodologia" className="hover:text-foreground text-muted-foreground">Metodologia</Link></li>
            <li><a href="https://dadosabertos.camara.leg.br" target="_blank" rel="noreferrer" className="hover:text-foreground text-muted-foreground">Dados abertos</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Brasil à Vera · Dados: Câmara dos Deputados
      </div>
    </footer>
  );
}
