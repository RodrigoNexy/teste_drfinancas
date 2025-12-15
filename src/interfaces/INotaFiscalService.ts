import { NotaFiscal } from '../entity/NotaFiscal';
import { DadosCriacaoNotaFiscalRequest } from '../types/NotaFiscalTypes';

export interface INotaFiscalService {
  criar(dados: DadosCriacaoNotaFiscalRequest): Promise<NotaFiscal>;
  listarTodas(): Promise<NotaFiscal[]>;
  buscarPorId(id: string): Promise<NotaFiscal | null>;
  emitir(id: string): Promise<NotaFiscal>;
}

