const { Sequelize } = require("sequelize");
const config = require("./db.config");
const initModels = require("../Models/init-models");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  port: config.PORT,
  dialect: config.dialect,
  pool: config.pool,
  logging: false
});

const models = initModels(sequelize);

async function initializeDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully');
}

module.exports = {
  sequelize,
  initializeDatabase,
  ...models
};
