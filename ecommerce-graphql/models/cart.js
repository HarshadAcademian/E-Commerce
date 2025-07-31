'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes)  => {
  class Cart extends Model {
    static associate(models) {
      // Each cart belongs to one user
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Each cart can have many cart items
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cartId',
        as: 'items'
      });
    }
  }

  Cart.init(
    {
      userId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Cart',
    }
  );

  return Cart;
};
