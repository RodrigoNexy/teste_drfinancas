import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { NotaFiscal, StatusNotaFiscal } from '../src/entity/NotaFiscal';

jest.mock('../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

import { NotaFiscalService } from '../src/service/NotaFiscalService';
import { DadosCriacaoNotaFiscalRequest } from '../src/types/NotaFiscalTypes';
import { IApiEmissaoNotaFiscal } from '../src/interfaces/IApiEmissaoNotaFiscal';
import { RespostaEmissaoNotaFiscal } from '../src/types/NotaFiscalTypes';

describe('NotaFiscalService', () => {
  let service: NotaFiscalService;
  let testDataSource: DataSource;
  let mockApiEmissao: jest.Mocked<IApiEmissaoNotaFiscal>;

  beforeAll(async () => {
    testDataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [NotaFiscal],
    });

    await testDataSource.initialize();

    mockApiEmissao = {
      emitir: jest.fn(),
    } as jest.Mocked<IApiEmissaoNotaFiscal>;

    service = new NotaFiscalService(mockApiEmissao, testDataSource);
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  beforeEach(async () => {
    const repository = testDataSource.getRepository(NotaFiscal);
    await repository.clear();
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar uma nova solicitação de nota fiscal com status PENDENTE_EMISSAO', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000.50,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const notaFiscal = await service.criar(dto);

      expect(notaFiscal).toBeDefined();
      expect(notaFiscal.id).toBeDefined();
      expect(notaFiscal.cnpj).toBe(dto.cnpj);
      expect(notaFiscal.municipio).toBe(dto.municipio);
      expect(notaFiscal.estado).toBe(dto.estado);
      expect(notaFiscal.valor).toBe(dto.valor);
      expect(notaFiscal.descricao).toBe(dto.descricao);
      expect(notaFiscal.status).toBe(StatusNotaFiscal.PENDENTE_EMISSAO);
      expect(notaFiscal.dataCriacao).toBeDefined();
      expect(notaFiscal.dataAtualizacao).toBeDefined();
    });
  });

  describe('listarTodas', () => {
    it('deve retornar uma lista vazia quando não há notas fiscais', async () => {
      const notas = await service.listarTodas();
      expect(notas).toEqual([]);
    });

    it('deve retornar todas as notas fiscais ordenadas por data de criação', async () => {
      const dto1: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço 1',
      };

      const dto2: DadosCriacaoNotaFiscalRequest = {
        cnpj: '98765432000111',
        municipio: 'Rio de Janeiro',
        estado: 'RJ',
        valor: 2000,
        dataDesejadaEmissao: '2024-01-16T00:00:00.000Z',
        descricao: 'Serviço 2',
      };

      const nota1 = await service.criar(dto1);
      await new Promise(resolve => setTimeout(resolve, 100));
      const nota2 = await service.criar(dto2);

      const notas = await service.listarTodas();

      expect(notas.length).toBe(2);
      const ids = notas.map(n => n.id);
      expect(ids).toContain(nota1.id);
      expect(ids).toContain(nota2.id);

      expect(notas[0].dataCriacao).toBeDefined();
      expect(notas[1].dataCriacao).toBeDefined();
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar null quando a nota fiscal não existe', async () => {
      const nota = await service.buscarPorId('id-inexistente');
      expect(nota).toBeNull();
    });

    it('deve retornar a nota fiscal quando encontrada', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const notaCriada = await service.criar(dto);
      const notaEncontrada = await service.buscarPorId(notaCriada.id);

      expect(notaEncontrada).toBeDefined();
      expect(notaEncontrada?.id).toBe(notaCriada.id);
      expect(notaEncontrada?.cnpj).toBe(dto.cnpj);
    });
  });

  describe('emitir', () => {
    it('deve lançar erro quando a nota fiscal não existe', async () => {
      await expect(service.emitir('id-inexistente')).rejects.toThrow('Nota fiscal não encontrada');
    });

    it('deve lançar erro quando a nota fiscal não está com status PENDENTE_EMISSAO', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const nota = await service.criar(dto);
      nota.status = StatusNotaFiscal.EMITIDA;
      const repository = testDataSource.getRepository(NotaFiscal);
      await repository.save(nota);

      await expect(service.emitir(nota.id)).rejects.toThrow('PENDENTE_EMISSAO');
    });

    it('deve emitir nota fiscal com sucesso quando a API retorna 200', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const nota = await service.criar(dto);

      const respostaMock: RespostaEmissaoNotaFiscal = {
        numeroNF: 'NF-12345',
        dataEmissao: '2024-01-15T10:00:00.000Z',
      };

      mockApiEmissao.emitir.mockResolvedValueOnce(respostaMock);

      const notaEmitida = await service.emitir(nota.id);

      expect(notaEmitida.status).toBe(StatusNotaFiscal.EMITIDA);
      expect(notaEmitida.numeroNF).toBe('NF-12345');
      expect(notaEmitida.dataEmissao).toBeDefined();
      expect(mockApiEmissao.emitir).toHaveBeenCalledWith(
        expect.objectContaining({
          cnpj: dto.cnpj,
          municipio: dto.municipio,
          estado: dto.estado,
          valor: dto.valor,
        })
      );
    });

    it('deve tratar erro 400 da API externa', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const nota = await service.criar(dto);

      mockApiEmissao.emitir.mockRejectedValueOnce(new Error('Erro de validação: Erro de validação'));

      await expect(service.emitir(nota.id)).rejects.toThrow('Erro de validação');
    });

    it('deve tratar erro 401 da API externa', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const nota = await service.criar(dto);

      mockApiEmissao.emitir.mockRejectedValueOnce(new Error('Erro de autenticação: Não autorizado'));

      await expect(service.emitir(nota.id)).rejects.toThrow('Erro de autenticação');
    });

    it('deve tratar erro 500 da API externa', async () => {
      const dto: DadosCriacaoNotaFiscalRequest = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const nota = await service.criar(dto);

      mockApiEmissao.emitir.mockRejectedValueOnce(new Error('Erro interno do servidor de emissão: Erro interno'));

      await expect(service.emitir(nota.id)).rejects.toThrow('Erro interno do servidor de emissão');
    });
  });
});

