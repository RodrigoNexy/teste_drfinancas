import {
  ConfiguracaoApiInvalidaError,
  ErroValidacaoApiError,
  ErroAutenticacaoApiError,
  ErroServidorApiError,
} from '../exceptions/ApiEmissaoExceptions';

export class HttpErrorHandler {
  static mapearErroParaRespostaHttp(erro: Error | string): { status: number; mensagem: string } {
    if (typeof erro === 'string') {
      return this.mapearPorMensagem(erro);
    }

    if (erro instanceof ConfiguracaoApiInvalidaError) {
      return { status: 500, mensagem: erro.message };
    }

    if (erro instanceof ErroValidacaoApiError) {
      return { status: 400, mensagem: erro.message };
    }

    if (erro instanceof ErroAutenticacaoApiError) {
      return { status: 400, mensagem: erro.message };
    }

    if (erro instanceof ErroServidorApiError) {
      return { status: 502, mensagem: erro.message };
    }

    return this.mapearPorMensagem(erro.message);
  }

  private static mapearPorMensagem(mensagemErro: string): { status: number; mensagem: string } {
    const erroLower = mensagemErro.toLowerCase();

    if (erroLower.includes('não encontrada') || erroLower.includes('não encontrado')) {
      return { status: 404, mensagem: mensagemErro };
    }

    if (erroLower.includes('pendente_emissao') || erroLower.includes('validação') || erroLower.includes('autenticação')) {
      return { status: 400, mensagem: mensagemErro };
    }

    if (erroLower.includes('interno do servidor')) {
      return { status: 502, mensagem: mensagemErro };
    }

    return { status: 500, mensagem: mensagemErro || 'Erro interno do servidor' };
  }
}

