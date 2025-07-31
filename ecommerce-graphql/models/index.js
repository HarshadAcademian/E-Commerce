import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import configObj from '../config/config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configObj[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Load all models dynamically
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith('.js'));

for (const file of modelFiles) {
  const { default: modelDef } = await import(`./${file}`);
  const model = modelDef(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Call associate methods
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
