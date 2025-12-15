import { Repository, DataSource } from 'typeorm';
import { AppDataSource } from '../config/database';
import { NotaFiscal, StatusNotaFiscal } from '../entity/NotaFiscal';
import axios from 'axios';

export interface CreateNotaFiscalDTO {
  cnpj: string;
  municipio: string;
  estado: string;
  valor: number;
  dataDesejadaEmissao: string;
  descricao: string;
}

export interface EmitirNotaFiscalResponse {
  numeroNF: string;
  dataEmissao: string;
}

export class NotaFiscalService {
  private repository: Repository<NotaFiscal>;

  constructor(dataSource?: DataSource) {
    const ds = dataSource || AppDataSource;
    this.repository = ds.getRepository(NotaFiscal);
  }

  async criar(dto: CreateNotaFiscalDTO): Promise<NotaFiscal> {
    const notaFiscal = this.repository.create({
      ...dto,
      dataDesejadaEmissao: new Date(dto.dataDesejadaEmissao),
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

    try {
      const payload = {
        cnpj: notaFiscal.cnpj,
        municipio: notaFiscal.municipio,
        estado: notaFiscal.estado,
        valor: notaFiscal.valor,
        dataDesejadaEmissao: notaFiscal.dataDesejadaEmissao.toISOString(),
        descricao: notaFiscal.descricao,
      };

      const apiUrl = process.env.API_EMISSAO_URL;
      const apiKey = process.env.API_EMISSAO_KEY;

      if (!apiUrl) {
        throw new Error('URL da API não configurada. Configure a variável API_EMISSAO_URL no arquivo .env');
      }

      if (!apiKey) {
        throw new Error('Chave de API não configurada. Configure a variável API_EMISSAO_KEY no arquivo .env');
      }

      const response = await axios.post<EmitirNotaFiscalResponse>(
        apiUrl,
        payload,
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        notaFiscal.numeroNF = response.data.numeroNF;
        notaFiscal.dataEmissao = new Date(response.data.dataEmissao);
        notaFiscal.status = StatusNotaFiscal.EMITIDA;

        return await this.repository.save(notaFiscal);
      }

      throw new Error('Erro ao emitir nota fiscal');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 400) {
          throw new Error(`Erro de validação: ${message}`);
        } else if (status === 401) {
          throw new Error(`Erro de autenticação: ${message}`);
        } else if (status === 500) {
          throw new Error(`Erro interno do servidor de emissão: ${message}`);
        }
      }

      throw new Error(`Erro ao emitir nota fiscal: ${error.message}`);
    }
  }
}

