import models from '../models';
import { Logger } from 'log4js';
import { HttpError, ERRORS } from '../middleware/errors';
import WsImpl from '../wsImpl';
import * as utils from '../utils';
// service
import { IService } from '../service/service-base';
import controller from 'src/controller';

declare module 'Koa' {
  interface BaseContext {
    // models
    oneModels: ReturnType<typeof models.OneModels>
    // logger
    logger: Logger
    // error
    errors: {
      ERRORS: typeof ERRORS,
      HttpError: typeof HttpError
    },
    // controller: typeof controller,
    service: IService,
    ws: typeof WsImpl,
    utils: typeof utils
  }
}
