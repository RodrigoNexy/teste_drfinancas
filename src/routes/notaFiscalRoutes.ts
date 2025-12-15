import { Router } from 'express';
import { NotaFiscalController } from '../controller/NotaFiscalController';
import { NotaFiscalService } from '../service/NotaFiscalService';
import { NotaFiscalValidator } from '../validator/NotaFiscalValidator';
import { ApiEmissaoNotaFiscal } from '../service/ApiEmissaoNotaFiscal';
import { ConfiguracaoApi } from '../config/ConfiguracaoApi';

const router = Router();
const configuracaoApi = new ConfiguracaoApi();
const apiEmissao = new ApiEmissaoNotaFiscal(configuracaoApi);
const service = new NotaFiscalService(apiEmissao);
const validator = new NotaFiscalValidator();
const controller = new NotaFiscalController(service, validator);

router.post('/notas-fiscais', (req, res) => controller.criar(req, res));
router.get('/notas-fiscais', (req, res) => controller.listar(req, res));
router.get('/notas-fiscais/:id', (req, res) => controller.buscar(req, res));
router.post('/notas-fiscais/:id/emitir', (req, res) => controller.emitir(req, res));

export default router;

