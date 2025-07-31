'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes)  => {
  class Order extends Model {
    static associate(models) {
      // Each order belongs to a user
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      // Each order can have many order items
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'items',
      });
    }
  }

  Order.init(
    {
      userId: DataTypes.INTEGER,
      total: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );

  return Order;
};
