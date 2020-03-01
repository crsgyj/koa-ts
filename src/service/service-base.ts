
import App from '../app';
import Koa from 'koa';

import HomeService from './home';
import UserService from './user';

/** Service */
export interface IService {
  home: HomeService,
  user: UserService
}

export interface ServiceBaseProps {
  ctx: Koa.ParameterizedContext,
  app: App
}

class ServiceBase {
  protected ctx: Koa.ParameterizedContext
  protected app: App
  constructor({ ctx, app }: ServiceBaseProps) {
    this.ctx = ctx;
    this.app = app;
  }

  // 配置
  protected get config() {
    return this.ctx.config;
  }

  // logger
  protected get logger() {
    return this.ctx.logger;
  }

  // 错误类型
  protected get errors() {
    return this.ctx.errors;
  }

  protected get oneModels() {
    return this.ctx.oneModels;
  }

  // service
  protected get service() {
    return this.ctx.service;
  }
}

export default ServiceBase;
