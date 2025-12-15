export interface DadosCriacaoNotaFiscalRequest {
  cnpj: string;
  municipio: string;
  estado: string;
  valor: number;
  dataDesejadaEmissao: string;
  descricao: string;
}

export interface RespostaEmissaoNotaFiscal {
  numeroNF: string;
  dataEmissao: string;
}

