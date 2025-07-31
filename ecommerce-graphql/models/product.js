'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes)  => {
  class Product extends Model {
    static associate(models) {
      // Each product belongs to a single category
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });
    }
  }

  Product.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      price: DataTypes.FLOAT,
      stock: DataTypes.INTEGER,
      imageUrl: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Product',
    }
  );

  return Product;
};
