const express = require("express");

function createCrudRouter(controller, idPath, options = {}) {
  const {
    createMiddleware = [],
    findAllMiddleware = [],
    mutationMiddleware = []
  } = options;
  const router = express.Router();

  router.route("/")
    .get(...findAllMiddleware, controller.findAll)
    .post(...createMiddleware, controller.create);

  router.route(`/${idPath}`)
    .get(controller.findOne)
    .put(...mutationMiddleware, controller.update)
    .delete(...mutationMiddleware, controller.delete);

  return router;
}

module.exports = createCrudRouter;
