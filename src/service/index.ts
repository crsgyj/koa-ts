import fs from 'fs';
import path from 'path';
import Koa from 'koa';

const PATHNAME = Symbol('PAHNAMEMAP');
const MODULE = Symbol('JSMODULE');
const MODULE_NAME = Symbol('MODULENAME');
const modules = new Map();

export default function ({ servDir, app }: any) {
  fs.readdirSync(servDir)
    .filter((file) => {
      const fileDir = path.join(__dirname, file);
      return fs.lstatSync(fileDir).isDirectory();
    }).forEach((m) => {
      const moduleFile = path.join(servDir, m);
      modules.set(m, {
        [MODULE_NAME]: m,
        [PATHNAME]: moduleFile,
        [MODULE]: require(moduleFile).default,
      });
    });

  const Handler = (ctx: Koa.ParameterizedContext) => ({
    get: (target: Map<string, any>, key: string) => {
      const moduleInfo = modules.get(key);
      if (!moduleInfo) {
        return undefined;
      }

      let serv = target.get(key);

      if (serv) {
        return serv;
      }
      const ServClass = moduleInfo[MODULE];
      serv = new ServClass({ ctx, app });
      target.set(key, serv);
      return serv;
    },
  });
  return async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
    const service = Object.setPrototypeOf({}, new Proxy(new Map(), Handler(ctx)));

    ctx.service = service;
    return next();
  };
}
