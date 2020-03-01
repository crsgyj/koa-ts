import ControllerBase from './controller-base';

export default class UserController extends ControllerBase {
  async list() {
    const { ctx } = this;
    const { reqBody } = ctx.state;

    const list = await this.service.user.list(reqBody);
    ctx.type = 'json';
    ctx.body = list;
  }
}