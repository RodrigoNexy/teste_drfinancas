import { NotaFiscalController } from '../controller/NotaFiscalController';
import { NotaFiscalService } from '../service/NotaFiscalService';
import { NotaFiscalValidator } from '../validator/NotaFiscalValidator';
import { ApiEmissaoNotaFiscal } from '../service/ApiEmissaoNotaFiscal';
import { ConfiguracaoApi } from './ConfiguracaoApi';

export class DependenciesContainer {
  private static _configuracaoApi: ConfiguracaoApi;
  private static _apiEmissao: ApiEmissaoNotaFiscal;
  private static _service: NotaFiscalService;
  private static _validator: NotaFiscalValidator;
  private static _controller: NotaFiscalController;

  static get configuracaoApi(): ConfiguracaoApi {
    if (!this._configuracaoApi) {
      this._configuracaoApi = new ConfiguracaoApi();
    }
    return this._configuracaoApi;
  }

  static get apiEmissao(): ApiEmissaoNotaFiscal {
    if (!this._apiEmissao) {
      this._apiEmissao = new ApiEmissaoNotaFiscal(this.configuracaoApi);
    }
    return this._apiEmissao;
  }

  static get service(): NotaFiscalService {
    if (!this._service) {
      this._service = new NotaFiscalService(this.apiEmissao);
    }
    return this._service;
  }

  static get validator(): NotaFiscalValidator {
    if (!this._validator) {
      this._validator = new NotaFiscalValidator();
    }
    return this._validator;
  }

  static get controller(): NotaFiscalController {
    if (!this._controller) {
      this._controller = new NotaFiscalController(this.service, this.validator);
    }
    return this._controller;
  }
}

