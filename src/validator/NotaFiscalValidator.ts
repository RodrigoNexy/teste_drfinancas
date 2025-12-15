import { DadosCriacaoNotaFiscalRequest } from '../types/NotaFiscalTypes';
import { INotaFiscalValidator } from '../interfaces/INotaFiscalValidator';

export class NotaFiscalValidator implements INotaFiscalValidator {
  private readonly camposObrigatorios: (keyof DadosCriacaoNotaFiscalRequest)[] = [
    'cnpj',
    'municipio',
    'estado',
    'valor',
    'dataDesejadaEmissao',
    'descricao',
  ];

  validarCamposObrigatorios(dados: Partial<DadosCriacaoNotaFiscalRequest>): boolean {
    return this.camposObrigatorios.every((campo) => {
      const valor = dados[campo];
      return valor !== undefined && valor !== null && valor !== '';
    });
  }

  validar(dados: Partial<DadosCriacaoNotaFiscalRequest>): string | null {
    if (!this.validarCamposObrigatorios(dados)) {
      return 'Todos os campos são obrigatórios';
    }

    return null;
  }
}

