import { IConfiguracaoApi } from '../interfaces/IConfiguracaoApi';

export class ConfiguracaoApi implements IConfiguracaoApi {
  obterUrlApi(): string {
    return process.env.API_EMISSAO_URL || '';
  }

  obterChaveApi(): string {
    return process.env.API_EMISSAO_KEY || '';
  }
}

