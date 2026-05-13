// Câmara dos Deputados — API client
// Docs: https://dadosabertos.camara.leg.br/swagger/api.html
const BASE = "https://dadosabertos.camara.leg.br/api/v2";

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "" && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Câmara API ${res.status}: ${url.pathname}`);
  return res.json();
}

export type Deputado = {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  email?: string | null;
  idLegislatura: number;
};

export type DeputadoDetalhe = {
  id: number;
  nomeCivil: string;
  ultimoStatus: {
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    urlFoto: string;
    email?: string;
    situacao: string;
    condicaoEleitoral: string;
    nomeEleitoral: string;
    gabinete?: { nome?: string; predio?: string; sala?: string; andar?: string; telefone?: string; email?: string };
  };
  cpf?: string;
  sexo?: string;
  dataNascimento?: string;
  municipioNascimento?: string;
  ufNascimento?: string;
  escolaridade?: string;
  redeSocial?: string[];
  urlWebsite?: string;
};

export type Proposicao = {
  id: number;
  siglaTipo: string;
  numero: number;
  ano: number;
  ementa: string;
};

export type Votacao = {
  id: string;
  data: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  descricao: string;
  aprovacao: number;
};

export const camaraApi = {
  listDeputados: (params: { siglaPartido?: string; siglaUf?: string; nome?: string; pagina?: number; itens?: number; ordenarPor?: string } = {}) =>
    get<{ dados: Deputado[]; links: any[] }>("/deputados", { itens: 24, ordenarPor: "nome", ...params }),

  getDeputado: (id: number | string) =>
    get<{ dados: DeputadoDetalhe }>(`/deputados/${id}`),

  getDespesas: (id: number | string, ano?: number) =>
    get<{ dados: Array<{ ano: number; mes: number; tipoDespesa: string; valorLiquido: number; nomeFornecedor: string }> }>(
      `/deputados/${id}/despesas`, { ano, itens: 100, ordem: "DESC", ordenarPor: "ano" }
    ),

  getDeputadoProposicoes: (id: number | string) =>
    get<{ dados: Proposicao[] }>(`/proposicoes`, { idDeputadoAutor: id, itens: 20, ordem: "DESC", ordenarPor: "id" }),

  listProposicoes: (params: { siglaTipo?: string; ano?: number; itens?: number; pagina?: number } = {}) =>
    get<{ dados: Proposicao[] }>("/proposicoes", { itens: 24, ordem: "DESC", ordenarPor: "id", ...params }),

  getProposicao: (id: number | string) =>
    get<{ dados: Proposicao & { dataApresentacao: string; statusProposicao: any; uriAutores: string; ementaDetalhada?: string; keywords?: string } }>(
      `/proposicoes/${id}`
    ),

  listVotacoes: (params: { itens?: number; pagina?: number; dataInicio?: string; dataFim?: string } = {}) =>
    get<{ dados: Votacao[] }>("/votacoes", { itens: 30, ordem: "DESC", ordenarPor: "dataHoraRegistro", ...params }),

  getVotacao: (id: string) =>
    get<{ dados: Votacao }>(`/votacoes/${id}`),

  listPartidos: () =>
    get<{ dados: Array<{ id: number; sigla: string; nome: string }> }>("/partidos", { itens: 100, ordem: "ASC", ordenarPor: "sigla" }),
};

export const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
