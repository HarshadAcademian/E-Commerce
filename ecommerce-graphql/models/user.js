'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes)  => {
  class User extends Model {
    static associate(models) {
      // One user has one cart
      User.hasOne(models.Cart, {
        foreignKey: 'userId',
        as: 'cart',
      });

      // One user can place many orders
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders',
      });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};
