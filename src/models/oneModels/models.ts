import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Logger } from 'log4js';
// 表
import User from './user.model';
// 表映射
export interface OneModels {
  // 用户
  user: typeof User
  [s: string]: any
}

export function Models(option: SequelizeOptions, utils?: {
  logger: Logger
}) {
  const { logger } = utils;
  const sequelize = new Sequelize({
    ...option,
    logging: (...args) => logger?.debug('sql: ', `${args}`),
  });
  sequelize.addModels([
    __dirname + '/*.model.js'
  ]);
  sequelize.authenticate()
    .then(() => {
      utils?.logger.info('Connect success to database.');
    })
    .catch(err => {
      utils?.logger.error(`Error in bsqModels connection. reason: ${err.message}`);
    });

  return sequelize.models as OneModels;
}
