import { IMiddleware } from 'koa-router';

export default class BaseController {
  protected ctx: Parameters<IMiddleware>[0]

  constructor(ctx?: Parameters<IMiddleware>[0]) {
    this.ctx = ctx;
  }
  
  protected get service() {
    return this.ctx.service;
  }

  protected get utils() {
    return this.ctx.utils;
  }

  protected get logger() {
    return this.ctx.logger;
  }

  protected get errors() {
    return this.ctx.errors;
  }

  
}
