'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes)  => {
  class Category extends Model {
    static associate(models) {
      // A category has many products
      Category.hasMany(models.Product, {
        foreignKey: 'categoryId',
        as: 'products',
      });
    }
  }

  Category.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Category',
    }
  );

  return Category;
};
