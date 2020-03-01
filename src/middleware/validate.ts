import _Joi from '@hapi/joi';
import { IMiddleware } from 'koa-router';

export const Joi = _Joi;

enum VALIDATE_TARGET {
  query = 'query',
  body = 'body',
  params = 'params'
}
export const parameterValidate: (schema: _Joi.Schema | ((ctx: Parameters<IMiddleware>[0]) => _Joi.Schema), prop: keyof typeof VALIDATE_TARGET) => IMiddleware = (schema, prop) => async function (ctx, next) {
  if (schema instanceof Function) {
    schema = schema(ctx);
  }

  const target = getTarget(ctx, prop);
  if (!target) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.NOT_ACCEPTABLE,
      message: `${prop} requires`
    });
  }
  const { value, error } = schema.validate(target, { abortEarly: true, allowUnknown: false });
  if (error) {
    throw new ctx.errors.HttpError({
      type: ctx.errors.ERRORS.NOT_ACCEPTABLE,
      message: error.message
    });
  }

  ctx.state.reqBody = value;
  return next();
};
function getTarget(ctx: Parameters<IMiddleware>[0], prop: string) {
  switch (prop) {
  case VALIDATE_TARGET.body: 
    return {...ctx.request.body};
  case VALIDATE_TARGET.params:
    return {...ctx.params};
  case VALIDATE_TARGET.query:
    return {...ctx.request.query};
  default:
    return null;
  }
}