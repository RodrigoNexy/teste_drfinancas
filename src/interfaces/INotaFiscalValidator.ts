import { DadosCriacaoNotaFiscalRequest } from '../types/NotaFiscalTypes';

export interface INotaFiscalValidator {
  validar(dados: Partial<DadosCriacaoNotaFiscalRequest>): string | null;
}

