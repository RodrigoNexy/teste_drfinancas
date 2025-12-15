import { DataSource } from 'typeorm';
import { NotaFiscal } from '../entity/NotaFiscal';
import path from 'path';

const databasePath = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'database.sqlite')
  : path.join(__dirname, '../../database.sqlite');

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: databasePath,
  synchronize: true,
  logging: false,
  entities: [NotaFiscal],
  migrations: [],
  subscribers: [],
});

