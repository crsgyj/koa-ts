import ServiceBase from '../service-base';

export default class HomeService extends ServiceBase {

  hello() {
    return '<h1>Hello!</h1>';
  }
}