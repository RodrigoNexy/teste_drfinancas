import axios from 'axios';
import { IApiEmissaoNotaFiscal, DadosEmissaoNotaFiscal } from '../interfaces/IApiEmissaoNotaFiscal';
import { IConfiguracaoApi } from '../interfaces/IConfiguracaoApi';
import { RespostaEmissaoNotaFiscal } from '../types/NotaFiscalTypes';
import { ConfiguracaoApiValidator } from '../validator/ConfiguracaoApiValidator';
import { AxiosErrorHandler } from '../utils/AxiosErrorHandler';

export class ApiEmissaoNotaFiscal implements IApiEmissaoNotaFiscal {
  private readonly validator: ConfiguracaoApiValidator;

  constructor(private readonly configuracao: IConfiguracaoApi) {
    this.validator = new ConfiguracaoApiValidator();
  }

  async emitir(dados: DadosEmissaoNotaFiscal): Promise<RespostaEmissaoNotaFiscal> {
    this.validator.validar(this.configuracao);

    try {
      const apiUrl = this.configuracao.obterUrlApi();
      const apiKey = this.configuracao.obterChaveApi();

      const response = await axios.post<RespostaEmissaoNotaFiscal>(
        apiUrl,
        dados,
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      AxiosErrorHandler.tratarErro(error);
    }
  }
}

