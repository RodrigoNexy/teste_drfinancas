import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { NotaFiscal, StatusNotaFiscal } from '../src/entity/NotaFiscal';

let mockDataSource: DataSource | null = null;

jest.mock('../src/config/database', () => ({
  get AppDataSource() {
    if (!mockDataSource) {
      throw new Error('AppDataSource não foi inicializado. Certifique-se de inicializar o testDataSource no beforeAll.');
    }
    return mockDataSource;
  },
}));

const createTestDataSource = async (): Promise<DataSource> => {
  const testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [NotaFiscal],
  });
  await testDataSource.initialize();
  return testDataSource;
};

describe('NotaFiscalController', () => {
  let app: express.Application;
  let testDataSource: DataSource;

  beforeAll(async () => {
    testDataSource = await createTestDataSource();
    mockDataSource = testDataSource;

    const notaFiscalRoutes = require('../src/routes/notaFiscalRoutes').default;

    app = express();
    app.use(express.json());
    app.use('/api', notaFiscalRoutes);
  });

  afterAll(async () => {
    if (testDataSource && testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  beforeEach(async () => {
    const repository = testDataSource.getRepository(NotaFiscal);
    await repository.clear();
  });

  describe('POST /api/notas-fiscais', () => {
    it('deve criar uma nova solicitação de nota fiscal', async () => {
      const payload = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000.50,
        dataDesejadaEmissao: '2024-01-15T00:00:00.000Z',
        descricao: 'Serviço de consultoria',
      };

      const response = await request(app)
        .post('/api/notas-fiscais')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.cnpj).toBe(payload.cnpj);
      expect(response.body.municipio).toBe(payload.municipio);
      expect(response.body.estado).toBe(payload.estado);
      expect(response.body.valor).toBe(payload.valor);
      expect(response.body.descricao).toBe(payload.descricao);
      expect(response.body.status).toBe('PENDENTE_EMISSAO');
    });

    it('deve retornar erro 400 quando faltam campos obrigatórios', async () => {
      const payload = {
        cnpj: '12345678000190',
        municipio: 'São Paulo',
      };

      const response = await request(app)
        .post('/api/notas-fiscais')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('obrigatórios');
    });
  });

  describe('GET /api/notas-fiscais', () => {
    it('deve retornar lista vazia quando não há notas fiscais', async () => {
      const response = await request(app)
        .get('/api/notas-fiscais')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('deve retornar todas as notas fiscais', async () => {
      const repository = testDataSource.getRepository(NotaFiscal);

      const nota1 = repository.create({
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: new Date('2024-01-15'),
        descricao: 'Serviço 1',
        status: StatusNotaFiscal.PENDENTE_EMISSAO,
      });

      const nota2 = repository.create({
        cnpj: '98765432000111',
        municipio: 'Rio de Janeiro',
        estado: 'RJ',
        valor: 2000,
        dataDesejadaEmissao: new Date('2024-01-16'),
        descricao: 'Serviço 2',
        status: StatusNotaFiscal.PENDENTE_EMISSAO,
      });

      const notasSalvas = await repository.save([nota1, nota2]);

      const response = await request(app)
        .get('/api/notas-fiscais')
        .expect(200);

      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/notas-fiscais/:id', () => {
    it('deve retornar 404 quando a nota fiscal não existe', async () => {
      const response = await request(app)
        .get('/api/notas-fiscais/id-inexistente')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrada');
    });

    it('deve retornar a nota fiscal quando encontrada', async () => {
      const repository = testDataSource.getRepository(NotaFiscal);

      const nota = repository.create({
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: new Date('2024-01-15'),
        descricao: 'Serviço de consultoria',
        status: StatusNotaFiscal.PENDENTE_EMISSAO,
      });

      const notaSalva = await repository.save(nota);

      const response = await request(app)
        .get(`/api/notas-fiscais/${notaSalva.id}`)
        .expect(200);

      expect(response.body.id).toBe(notaSalva.id);
      expect(response.body.cnpj).toBe(nota.cnpj);
    });
  });

  describe('POST /api/notas-fiscais/:id/emitir', () => {
    it('deve retornar 404 quando a nota fiscal não existe', async () => {
      const response = await request(app)
        .post('/api/notas-fiscais/id-inexistente/emitir')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 400 quando a nota fiscal não está com status PENDENTE_EMISSAO', async () => {
      const repository = testDataSource.getRepository(NotaFiscal);

      const nota = repository.create({
        cnpj: '12345678000190',
        municipio: 'São Paulo',
        estado: 'SP',
        valor: 1000,
        dataDesejadaEmissao: new Date('2024-01-15'),
        descricao: 'Serviço de consultoria',
        status: StatusNotaFiscal.EMITIDA,
      });

      const notaSalva = await repository.save(nota);

      const response = await request(app)
        .post(`/api/notas-fiscais/${notaSalva.id}/emitir`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

