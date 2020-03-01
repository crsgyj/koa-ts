import Router from '../router-base';
import Controller from '../../controller';
import { parameterValidate, Joi } from '../../middleware/validate';

const router = new Router();

/**
 * 
 * @api {Get} /users 获取用户列表
 * @apiGroup 用户
 * @apiVersion  0.1.0
 * 
 * 
 * @apiSuccess (200) {Number} [page=1] 页数
 * @apiSuccess (200) {Number} [per_page=15] 每页个数
 * @apiSuccess (200) {String{0..60}} [username] 用户名
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 * 
 * 
 */
const fetchUserDetailSchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  per_page: Joi.number().integer().positive().default(20),
  username: Joi.string().max(60).optional()
});
router.get('/users', parameterValidate(fetchUserDetailSchema, 'query'), Controller.user.list)

export default router;