import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import { AppDataSource } from './config/database';
import notaFiscalRoutes from './routes/notaFiscalRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', notaFiscalRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

AppDataSource.initialize()
  .then(() => {
    console.log('Banco de dados inicializado com sucesso');
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  });

