import axios from 'axios';
import {
  ErroValidacaoApiError,
  ErroAutenticacaoApiError,
  ErroServidorApiError,
  ErroEmissaoApiError,
} from '../exceptions/ApiEmissaoExceptions';

export class AxiosErrorHandler {
  static tratarErro(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 400) {
        throw new ErroValidacaoApiError(`Erro de validação: ${message}`);
      } else if (status === 401) {
        throw new ErroAutenticacaoApiError(`Erro de autenticação: ${message}`);
      } else if (status === 500) {
        throw new ErroServidorApiError(`Erro interno do servidor de emissão: ${message}`);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new ErroEmissaoApiError(`Erro ao emitir nota fiscal: ${errorMessage}`);
  }
}

