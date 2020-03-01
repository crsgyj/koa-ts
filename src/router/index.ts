import Router from './router-base';
import controller from '../controller';
import apiRouter from './api';

const router = new Router();

// status.ok
router.get('status.ok', '/status.ok', controller.home.ok);
// api接口
router.use('/api', apiRouter.routes());

export default router;