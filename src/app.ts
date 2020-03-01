/// <reference path="types/koa.d.ts" />

import { install as sourceMapInstall } from 'source-map-support';
import Koa from 'koa';
import path from 'path';
import cors from '@koa/cors';
import Logger from 'log4js';
import bodyParser from 'koa-bodyparser';
import models from './models';
import wsImpl from './wsImpl';

import router from './router';
// import controller from './controller';
import { errorHandler, ERRORS, HttpError } from './middleware/errors';
import service from './service';
import http from 'http';
import * as utils from './utils';

sourceMapInstall();

export default class App {
  _koa: Koa
  _server: http.Server
  _oneModels: ReturnType<typeof models.OneModels>
  env: string
  config: any
  logger: Logger.Logger = Logger.getLogger();

  get isDev() {
    return this.env === 'development';
  }

  constructor({
    config,
  }: {
    config: any
  }) {
    this.config = config;
    this.env = this.koa.env;
    this.logger.level = this.isDev ? Logger.levels.DEBUG.levelStr : Logger.levels.INFO.levelStr;
    this.koa.context.config = this.config;
    this.koa.context.oneModels = this.oneModels;
    this.koa.context.logger = this.logger;
    this.koa.context.errors = { ERRORS, HttpError };
    this.koa.context.ws = wsImpl;
    this.koa.context.utils = utils;
    //   this.koa.context.controller = controller;
  }
  
  listen(port: number, callback: () => void) {
    this._server.listen(port);
    const addr: any = this._server.address();
    this.logger.info(`[${this.koa.env}]Server started, listening at ${addr.address}:${addr.port}`);
    callback && callback();
  }

  get koa() {
    if (this._koa) {
      return this._koa;
    }
    this._koa = new Koa();
    this._server = http.createServer(this._koa.callback());

    this._koa
      .use(cors({
        maxAge: 60000,
        origin: function () {
          return '*';
        }
      }))
      .use(bodyParser())
      .use(errorHandler())
      .use(service({ 
        servDir: path.join(this.config.rootPath, 'dist/service'), 
        app: this,
      }))
      .use(router.routes());
      
    return this._koa;
  }

  get oneModels() {
    if (this._oneModels) {
      return this._oneModels;
    }
    // 配置
    const options = this.config.models.bsq;
    // 连接实例
    this._oneModels = models.OneModels(options, {
      logger: this.logger
    });
    return this._oneModels;
  }
}
