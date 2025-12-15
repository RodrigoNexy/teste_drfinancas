import { IConfiguracaoApi } from '../interfaces/IConfiguracaoApi';
import { ConfiguracaoApiInvalidaError } from '../exceptions/ApiEmissaoExceptions';

export class ConfiguracaoApiValidator {
  validar(configuracao: IConfiguracaoApi): void {
    const apiUrl = configuracao.obterUrlApi();
    const apiKey = configuracao.obterChaveApi();

    if (!apiUrl) {
      throw new ConfiguracaoApiInvalidaError(
        'URL da API não configurada. Configure a variável API_EMISSAO_URL no arquivo .env'
      );
    }

    if (!apiKey) {
      throw new ConfiguracaoApiInvalidaError(
        'Chave de API não configurada. Configure a variável API_EMISSAO_KEY no arquivo .env'
      );
    }
  }
}

