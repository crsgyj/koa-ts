import HomeController from './Home';
import WebsocketController from './Websocket';
import UserController from './user';

export default {
  /** home */
  home: new HomeController(),
  /** websocket */
  websocket: new WebsocketController(),
  /** user */
  user: new UserController(),
};