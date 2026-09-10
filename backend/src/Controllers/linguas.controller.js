const { linguas } = require("../Config/database");
const createCrudController = require("./crud.controller");

module.exports = createCrudController(linguas, "id_lingua");
