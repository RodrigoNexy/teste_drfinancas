import { RespostaEmissaoNotaFiscal } from '../types/NotaFiscalTypes';

export interface DadosEmissaoNotaFiscal {
  cnpj: string;
  municipio: string;
  estado: string;
  valor: number;
  dataDesejadaEmissao: string;
  descricao: string;
}

export interface IApiEmissaoNotaFiscal {
  emitir(dados: DadosEmissaoNotaFiscal): Promise<RespostaEmissaoNotaFiscal>;
}

