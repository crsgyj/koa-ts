import ControllerBase from './controller-base';

export default class HomeController extends ControllerBase {
  ok() {
    const { ctx } = this;
    ctx.body = 'ok';
  }
  
  errs() {
    const { ctx, utils } = this;

    ctx.type = 'json';
    ctx.body = utils.httpHelper.success({
      data: Object.values(ctx.errors.ERRORS),
    });
  }

  errDetail() {
    const { ctx } = this;
    throw new ctx.errors.HttpError({
      type: (ctx.params['error'] as string).toUpperCase()
    });
  }
}