
import { DataTypes } from 'sequelize';
import { Table, Column, Model, PrimaryKey, Comment, Scopes, DefaultScope, UpdatedAt, CreatedAt, AutoIncrement, DeletedAt } from 'sequelize-typescript';
import { likeScopeFunc } from '../utils';

@DefaultScope({
  attributes: {
    exclude: ['password']
  }
})
@Scopes(() => ({
  username: likeScopeFunc('username')
}))
@Table({
  tableName: 'user',
  modelName: 'user',
  timestamps: true,
  paranoid: true
})
export default class UserModel extends Model<UserModel> {

  @PrimaryKey
  @Comment('用户ID')
  @AutoIncrement
  @Column(DataTypes.BIGINT({ length: 20 }))
  userID: string
  /** userLoginname */
  @Comment('用户账号')
  @Column(DataTypes.STRING(60))
  username: string
  /** userPassword */
  @Comment('登录密码')
  @Column(DataTypes.STRING(32))
  password: string
  /** createdAt */
  @Comment('创建时间')
  @Column(DataTypes.DATE)
  @CreatedAt
  createdAt: Date
  /** createdAt */
  @Comment('更新时间')
  @Column(DataTypes.DATE)
  @UpdatedAt
  updatedAt: Date
  /** createdAt */
  @Comment('删除时间')
  @Column(DataTypes.DATE)
  @DeletedAt
  deletedAt: Date
}
