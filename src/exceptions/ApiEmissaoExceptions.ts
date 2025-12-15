export class ConfiguracaoApiInvalidaError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ConfiguracaoApiInvalidaError';
  }
}

export class ErroValidacaoApiError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroValidacaoApiError';
  }
}

export class ErroAutenticacaoApiError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroAutenticacaoApiError';
  }
}

export class ErroServidorApiError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroServidorApiError';
  }
}

export class ErroEmissaoApiError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroEmissaoApiError';
  }
}

