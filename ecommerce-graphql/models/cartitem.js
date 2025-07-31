'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes)  => {
  class CartItem extends Model {
    static associate(models) {
      // CartItem belongs to one cart
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cartId',
        as: 'cart'
      });

      // CartItem is linked to one product
      CartItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  CartItem.init(
    {
      cartId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'CartItem',
    }
  );

  return CartItem;
};
