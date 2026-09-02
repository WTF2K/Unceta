const { produto_traducoes, produtos } = require("../Config/database");
const createCatalogCrudController = require('./catalog-crud.controller');

module.exports = createCatalogCrudController(produtos, produto_traducoes, 'id_prod');
