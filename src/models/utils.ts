import { Op } from 'sequelize';
import { isNil } from 'lodash';

export function likeScopeFunc(prop: string) {
  return function (v: string) {
    return v
      ? ({ where: { [prop]: { [Op.like]: `%${v}%` } } })
      : null;
  };
}

export function equalScopeFunc<PropType>(prop: string, checkNil: (...args: any) => any = isNil) {
  return function (v: PropType) {
    return checkNil(v)
      ? null
      : ({ where: { [prop]: v } });
  };
}
export function betweenScopeFunc(prop: string, checkNil: (...args: any) => any = isNil) {
  checkNil = _v => !_v;
  return function (v1: string | Date, v2: string | Date) {
    return checkNil(v1) && checkNil(v2)
      ? null
      : ({
        where: {
          [prop]: {
            [Op.between]: [v1, v2]
          }
        }
      });
  };
}

export function timeGreaterScopeFunc<PropType>(prop: string, checkNil: (...args: any) => any = isNil) {
  checkNil = _v => !_v;
  return function (v: PropType) {
    return checkNil(v)
      ? null
      : ({
        where: {
          [prop]: {
            [Op.gt]: v
          }
        }
      });
  };
}
export function timeLessScopeFunc<PropType>(prop: string, checkNil: (...args: any) => any = isNil) {
  checkNil = _v => !_v;
  return function (v: PropType) {
    return checkNil(v)
      ? null
      : ({
        where: {
          [prop]: {
            [Op.lt]: v
          }
        }
      });
  };
}

export function hideScope(...props: string[]) {
  return {
    attributes: {
      exclude: props,
    }
  };
}

export function neScope(prop: string, value: any) {
  return {
    where: {
      [prop]: {
        [Op.ne]: value
      }
    }
  };
}

export function eqScope(prop: string, value: any) {
  return {
    where: {
      [prop]: value
    }
  };
}