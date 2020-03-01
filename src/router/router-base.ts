import KoaRouter, { IMiddleware } from 'koa-router';
import ControllerBase from '../controller/controller-base';

interface RouterWrapper {
  get(path: string, ...args: any[]): void
  post(path: string, ...args: any[]): void
  put(path: string, ...args: any[]): void
  delete(path: string, ...args: any[]): void
  patch(path: string, ...args: any[]): void
  use(...args: any[]): void
}

export default class Router implements RouterWrapper  {
  protected router: KoaRouter;

  routes(): IMiddleware {
    return this.router.routes();
  }

  constructor() {
    this.router = new KoaRouter();
  }

  get(path: string, ...args: any[]): void {
    this.router.get(path, ...this.bindArg(args));
  }

  post(path: string, ...args: any[]) {
    this.router.post(path, ...this.bindArg(args));
  }
  put(path: string, ...args: any[]) {
    this.router.put(path, ...this.bindArg(args));
  }
  delete(path: string, ...args: any[]) {
    this.router.delete(path, ...this.bindArg(args));
  }
  patch(path: string, ...args: any[]) {
    this.router.patch(path, ...this.bindArg(args));
  }

  use(...args: any[]) {
    this.router.use(...this.bindArg(args));
  }
 
  // 对controller中的公共方法绑定this, 绑定对象为包含本次请求上下文的BaseController的示例
  protected bindArg(args: any[]) {
    const _args = args.slice();
    const len = _args.length;
    for (let i = 0; i < len; i++) {
      // 若是非继承的方法。绑定 this。
      // 若有原型，则应是router中间件的方法。
      if (typeof _args[i] === 'function' && !args[i].prototype) {
        const func = _args[i];
        _args[i] = (async function (ctx, next) {
          if (!ctx['$__baseController']) {
            ctx['$__baseController'] = new ControllerBase(ctx);
          }
          return func.apply(ctx['$__baseController'], [ctx, next]);
        }) as IMiddleware;
      }
    }
    return _args;
  }
}