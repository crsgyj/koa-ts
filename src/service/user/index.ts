import ServiceBase from '../service-base';

export default class HomeService extends ServiceBase {

  async list({
    page,
    per_page,
    username
  }: {
    page: number,
    per_page: number,
    username: string
  }) {
    const models = this.oneModels;
    const scopedModel = models.user.scope([
      { method: ['username', username]}
    ]);

    const { rows, count } = await scopedModel.findAndCountAll({
      limit: page,
      offset: (page - 1) * per_page
    });

    return {
      page: page,
      per_page: per_page,
      data: rows,
      count: count,
      total_page: Math.ceil(count / per_page) || 1
    }
  }
}