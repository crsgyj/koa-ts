import ControllerBase from './controller-base';
import WsImpl from '../wsImpl';

export default class WebsocketController extends ControllerBase {

  async handleSocket() {
    this.ctx.respond = false;
    this.ctx.status = 200;
    const ws = await WsImpl.handleRequest(this.ctx);

    ws.handleMessage = async (msg) => {
      // 当子协议不是chat, 做echo响应
      if (ws.subprotocol !== 'chat') {
        ws.sendJSON(msg);
        return;
      }
      // 业务逻辑
      // ...
    };
  }

}