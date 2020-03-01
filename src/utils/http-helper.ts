export interface ICallback {
  data?: any,
  success?: boolean,
  code?: number,
  errMsg?: string
}

type httpSuccOpts = {
  data: any
}
type httpErrOpts = {
  code: number,
  errMsg: string,
  status?: number
}
export const httpHelper = {
  success: (opts: httpSuccOpts): ICallback => ({
    success: true,
    code: 0,
    errMsg: '',
    data: opts.data,
  }),
  error: (opts: httpErrOpts): ICallback | string => opts.status < 500 ? ({
    success: false,
    code: opts.code,
    errMsg: opts.errMsg,
    data: null,
  }) : 'Internal Server Error'
};