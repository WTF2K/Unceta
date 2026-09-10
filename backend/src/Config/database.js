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
  const modelsInDependencyOrder = [
    models.admins,
    models.conteudos,
    models.linguas,
    models.messages,
    models.noticias,
    models.setores,
    models.produtos,
    models.traducoes,
    models.produto_traducoes,
    models.setor_traducoes,
    models.noticia_traducoes,
    models.certificacao_traducoes,
    models.vistas_produto
  ];

  for (const model of modelsInDependencyOrder) {
    await model.sync({ alter: true });
  }
  console.log('Database synced successfully');
}

module.exports = {
  sequelize,
  initializeDatabase,
  ...models
};
