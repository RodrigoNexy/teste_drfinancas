import { Router } from 'express';
import { NotaFiscalController } from '../controller/NotaFiscalController';

const router = Router();
const controller = new NotaFiscalController();

router.post('/notas-fiscais', (req, res) => controller.criar(req, res));
router.get('/notas-fiscais', (req, res) => controller.listar(req, res));
router.get('/notas-fiscais/:id', (req, res) => controller.buscar(req, res));
router.post('/notas-fiscais/:id/emitir', (req, res) => controller.emitir(req, res));

export default router;

