const { admins } = require("../Config/database");
const createCrudController = require("./crud.controller");

module.exports = createCrudController(admins, "id_admin");
