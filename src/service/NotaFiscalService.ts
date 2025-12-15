import { Repository, DataSource } from 'typeorm';
import { AppDataSource } from '../config/database';
import { NotaFiscal, StatusNotaFiscal } from '../entity/NotaFiscal';
import { DadosCriacaoNotaFiscalRequest } from '../types/NotaFiscalTypes';
import { IApiEmissaoNotaFiscal } from '../interfaces/IApiEmissaoNotaFiscal';
import { INotaFiscalService } from '../interfaces/INotaFiscalService';

export class NotaFiscalService implements INotaFiscalService {
  private repository: Repository<NotaFiscal>;

  constructor(
    private readonly apiEmissao: IApiEmissaoNotaFiscal,
    dataSource?: DataSource
  ) {
    const ds = dataSource || AppDataSource;
    this.repository = ds.getRepository(NotaFiscal);
  }

  async criar(dados: DadosCriacaoNotaFiscalRequest): Promise<NotaFiscal> {
    const notaFiscal = this.repository.create({
      ...dados,
      dataDesejadaEmissao: new Date(dados.dataDesejadaEmissao),
      status: StatusNotaFiscal.PENDENTE_EMISSAO,
    });

    return await this.repository.save(notaFiscal);
  }

  async listarTodas(): Promise<NotaFiscal[]> {
    return await this.repository.find({
      order: {
        dataCriacao: 'DESC',
      },
    });
  }

  async buscarPorId(id: string): Promise<NotaFiscal | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async emitir(id: string): Promise<NotaFiscal> {
    const notaFiscal = await this.buscarPorId(id);

    if (!notaFiscal) {
      throw new Error('Nota fiscal não encontrada');
    }

    if (notaFiscal.status !== StatusNotaFiscal.PENDENTE_EMISSAO) {
      throw new Error('Apenas notas fiscais com status PENDENTE_EMISSAO podem ser emitidas');
    }

    const dadosEmissao = {
      cnpj: notaFiscal.cnpj,
      municipio: notaFiscal.municipio,
      estado: notaFiscal.estado,
      valor: notaFiscal.valor,
      dataDesejadaEmissao: notaFiscal.dataDesejadaEmissao.toISOString(),
      descricao: notaFiscal.descricao,
    };

    const resposta = await this.apiEmissao.emitir(dadosEmissao);

    notaFiscal.numeroNF = resposta.numeroNF;
    notaFiscal.dataEmissao = new Date(resposta.dataEmissao);
    notaFiscal.status = StatusNotaFiscal.EMITIDA;

    return await this.repository.save(notaFiscal);
  }
}

