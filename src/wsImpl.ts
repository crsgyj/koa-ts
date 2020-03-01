import NodeWebsocket from 'websocket';
import { IMiddleware } from 'koa-router';

type Ctx = Parameters<IMiddleware>[0];
type Conn = NodeWebsocket.connection;

const ConnMap = new Map<string, WsImpl>();
const GroupMap = new Map<string, Map<string, WsImpl>>();

enum CLOSE_REASON {
  CLOSE_REASON_NORMAL = 1000,
  CLOSE_REASON_GOING_AWAY = 1001,
  CLOSE_REASON_PROTOCOL_ERROR = 1002,
  CLOSE_REASON_UNPROCESSABLE_INPUT = 1003,
  CLOSE_REASON_RESERVED = 1004, // Reserved value.  Undefined meaning.
  CLOSE_REASON_NOT_PROVIDED = 1005, // Not to be used on the wire
  CLOSE_REASON_ABNORMAL = 1006, // Not to be used on the wire
  CLOSE_REASON_INVALID_DATA = 1007,
  CLOSE_REASON_POLICY_VIOLATION = 1008,
  CLOSE_REASON_MESSAGE_TOO_BIG = 1009,
  CLOSE_REASON_EXTENSION_REQUIRED = 1010,
  CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011,
  CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015, 
}

const config: NodeWebsocket.IServerConfig = {
  httpServer: null,
  maxReceivedFrameSize: 0x10000,
  maxReceivedMessageSize: 0x100000,
  fragmentOutgoingMessages: true,
  fragmentationThreshold: 0x4000,
  keepalive: true,
  keepaliveInterval: 20000,
  dropConnectionOnKeepaliveTimeout: true,
  keepaliveGracePeriod: 10000,
  useNativeKeepalive: false,
  assembleFragments: true,
  autoAcceptConnections: false,
  ignoreXForwardedFor: false,
  disableNagleAlgorithm: true,
  closeTimeout: 5000
};

export default class WsImpl {
  readonly conn: Conn
  protected ctx: Ctx
  protected key: string
  readonly subprotocol: string
  private _groups: string[] = []

  get groups() {
    return this._groups;
  }

 
  private get logger() {
    return this.ctx ? this.ctx.logger : null;
  }

  get ConnMap() {
    return ConnMap;
  }
  get GroupMap() {
    return GroupMap;
  }

  static get conns() {
    return ConnMap;
  }


  // handle ctx
  static async handleRequest(ctx: Ctx): Promise<WsImpl> {
    // 封装请求 
    const wsReq = new NodeWebsocket.request(ctx.socket, ctx.req, config);
    // 检查跨域
    if (!WsImpl.checkOrigin(wsReq.origin)) {
      wsReq.reject(403, 'Origin not allowed.');
      return Promise.reject('Upgrade Fail, Origin not allowed.');
    }
    // 握手
    try {
      wsReq.readHandshake();
    } catch (err) {
      const errMsg = `HandShake error, reason: ${err.message}`;
      ctx.logger.debug(errMsg);
      wsReq.reject(400, err.message);
      return Promise.reject(errMsg);
    }
  
    let wsImpl: WsImpl;
    try {
      const conn = await new Promise<NodeWebsocket.connection>((resolve) => {
        wsReq.on('requestAccepted', (conn) => {
          resolve(conn);
        });
        // 建立socket连接
        wsReq.accept(wsReq.requestedProtocols[0] || null, wsReq.origin);
      });
      ctx.logger.debug( wsReq.httpRequest.headers);
      const key = wsReq.httpRequest.headers['sec-websocket-key'] as string;
      if (!key) {
        return Promise.reject('missing sec-websocket-key');
      }
      wsImpl = new WsImpl({
        conn: conn,
        ctx: ctx,
        key: key,
      });
    } catch (err) {
      return Promise.reject(`Connection establish error, ${err.message}`);
    }
    return wsImpl;
  }

  constructor(options: {
    conn: NodeWebsocket.connection,
    key: string,
    ctx: Ctx
  }) {
    this.conn = options.conn;
    this.ctx = options.ctx;
    this.key = options.key;
    this.subprotocol = options.conn.protocol;
    this.ConnMap.set(this.key, this);
    // 处理错误
    this._handleError();
    // 处理关闭
    this._handleClose();
    // 处理接收数据
    this._handleReceive();
  }

  // 客户端暴露重写方法 --------------------------
  public handleMessage(msg: NodeWebsocket.IMessage): void {}
  static checkOrigin(origin: string): boolean { return true; }
  // public handleError(err: Error): void {}
  // public handleClose(): void {}
  // -------------------------------------
  // 广播
  static broadcast(data: any, groupName: string) {
    const gmap = GroupMap.get(groupName);
    if (!gmap) {
      console.error(`Group [${groupName}] not exists.`);
      return;
    }
    for (const conn of gmap.values()) {
      conn.sendJSON(data);
    }
  }
  // 广播
  public broadcast(data: any, groupName: string) {
    const gmap = this.GroupMap.get(groupName);
    if (gmap) {
      this._groups = this.groups.filter(e => e !== groupName);
      this.logger.error(`Group [${groupName}] not exists.`);
      return;
    }
    if (!this.groups.includes(groupName)) {
      this.logger.error(`not in group [${groupName}]`);
      return;
    }
    for (const conn of gmap.values()) {
      conn.sendJSON(data);
    }
  }
  // 发送json消息
  public sendJSON(data: any) {
    return this.send(JSON.stringify(data));
  }

  // 发消息
  public send(data: Buffer | NodeWebsocket.IStringified): Promise<void> {
    if (!this.conn || this.conn.state !== 'open') {
      this.close();
      return;
    }
    return new Promise((resolve, reject) => {
      this.conn.send(data, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
  // 关闭
  public close(err?: Error, status: number = CLOSE_REASON.CLOSE_REASON_ABNORMAL) {
    if (!this.conn) {
      return;
    }
    if (Object.values(CLOSE_REASON).includes(status) == false) {
      status = CLOSE_REASON.CLOSE_REASON_ABNORMAL;
    }
    // 清除缓存
    this.ConnMap.delete(this.key);
    for (const groupName of this.groups) {
      this.leaveGroup(groupName);
    }
    // 关闭连接
    this.conn.close(status, err ? err.message : 'Error');
    this.ConnMap.delete(this.key);
  }
  // 加入组
  public joinGroup(groupName: string) {
    let gmap = this.GroupMap.get(groupName);
    if (!gmap) {
      const gmap = new Map();
      gmap.set(this.key, this);
      this.GroupMap.set(groupName, gmap);
    } else {
      gmap.set(this.key, this);
    }
    this._groups.push(groupName);
  }
  // 离开组
  public leaveGroup(groupName: string) {
    let gmap = this.GroupMap.get(groupName);
    if (gmap) {
      gmap.delete(this.key);
      if (!gmap.size) {
        this.GroupMap.delete(groupName);
      }
    }
    this._groups = this._groups.filter(e => e !== groupName);
  }
  // 处理接收数据
  private _handleReceive() {
    this.conn.on('message', (msg) => {
      this.logger.debug('Receive Message: ', msg);

      if (msg.type !== 'utf8') {
        const errMsg = 'Message type not accpect';
        this.close(new Error(errMsg), CLOSE_REASON.CLOSE_REASON_INVALID_DATA);
        return;
      }
      let jsonData = null;
      try {
        jsonData = JSON.parse(msg.utf8Data);
      } catch(err) {
        this.close(new Error('Require json data'), CLOSE_REASON.CLOSE_REASON_INVALID_DATA);
        return;
      }
      try {
        this.handleMessage(jsonData);
      } catch(err) {
        this.logger.debug('HandleMessage error', err);
        this.close(err);
      }
    });
  }

  // 处理错误
  private _handleError() {
    this.conn.on('error', (err) => {
      this.logger.debug(`Connection error - message: ${err.message} (key:${this.key})`);
      this.close(err);
    });
  }
  // 处理关闭
  private _handleClose() {
    this.conn.on('close', (code, desc) => {
      this.logger.debug(`Connection closed - code: ${code}, reason: ${desc} (key:${this.key})`);
    });
  }

}
