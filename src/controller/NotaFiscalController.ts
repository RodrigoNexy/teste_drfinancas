import { Request, Response } from 'express';
import { DadosCriacaoNotaFiscalRequest } from '../types/NotaFiscalTypes';
import { HttpErrorHandler } from '../utils/HttpErrorHandler';
import { INotaFiscalService } from '../interfaces/INotaFiscalService';
import { INotaFiscalValidator } from '../interfaces/INotaFiscalValidator';

export class NotaFiscalController {
  constructor(
    private readonly service: INotaFiscalService,
    private readonly validator: INotaFiscalValidator
  ) {}

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const dadosRequisicao: DadosCriacaoNotaFiscalRequest = req.body;

      const erroValidacao = this.validator.validar(dadosRequisicao);
      if (erroValidacao) {
        res.status(400).json({ error: erroValidacao });
        return;
      }

      const notaFiscal = await this.service.criar(dadosRequisicao);
      res.status(201).json(notaFiscal);
    } catch (error: unknown) {
      this.tratarErro(error, res, 'Erro ao criar nota fiscal');
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const notasFiscais = await this.service.listarTodas();
      res.status(200).json(notasFiscais);
    } catch (error: any) {
      this.tratarErro(error, res, 'Erro ao listar notas fiscais');
    }
  }

  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notaFiscal = await this.service.buscarPorId(id);

      if (!notaFiscal) {
        res.status(404).json({ error: 'Nota fiscal não encontrada' });
        return;
      }

      res.status(200).json(notaFiscal);
    } catch (error: any) {
      this.tratarErro(error, res, 'Erro ao buscar nota fiscal');
    }
  }

  async emitir(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notaFiscal = await this.service.emitir(id);
      res.status(200).json(notaFiscal);
    } catch (error: any) {
      this.tratarErro(error, res, 'Erro ao emitir nota fiscal');
    }
  }

  private tratarErro(error: unknown, res: Response, mensagemPadrao: string): void {
    const erro = error instanceof Error ? error : new Error(mensagemPadrao);
    const { status, mensagem } = HttpErrorHandler.mapearErroParaRespostaHttp(erro);
    res.status(status).json({ error: mensagem });
  }
}

