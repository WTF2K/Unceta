const { setor_traducoes, setores } = require("../Config/database");
const createCatalogCrudController = require('./catalog-crud.controller');

module.exports = createCatalogCrudController(setores, setor_traducoes, 'id_setor');
