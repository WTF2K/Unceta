function createCrudController(Model, primaryKey) {
  const controller = {
    async create(req, res) {
      try {
        const record = await Model.create(req.body);
        return res.status(201).json(record);
      } catch (error) {
        return res.status(500).json({ message: "Erro ao criar o registo.", error: error.message });
      }
    },

    async findAll(req, res) {
      try {
        const records = await Model.findAll();
        return res.status(200).json(records);
      } catch (error) {
        return res.status(500).json({ message: "Erro ao obter os registos.", error: error.message });
      }
    },

    async findOne(req, res) {
      try {
        const record = await Model.findByPk(req.params[primaryKey]);
        if (!record) {
          return res.status(404).json({ message: "Registo não encontrado." });
        }
        return res.status(200).json(record);
      } catch (error) {
        return res.status(500).json({ message: "Erro ao obter o registo.", error: error.message });
      }
    },

    async update(req, res) {
      try {
        const record = await Model.findByPk(req.params[primaryKey]);
        if (!record) {
          return res.status(404).json({ message: "Registo não encontrado." });
        }
        await record.update(req.body);
        return res.status(200).json(record);
      } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar o registo.", error: error.message });
      }
    },

    async remove(req, res) {
      try {
        const record = await Model.findByPk(req.params[primaryKey]);
        if (!record) {
          return res.status(404).json({ message: "Registo não encontrado." });
        }
        await record.destroy();
        return res.status(204).send();
      } catch (error) {
        return res.status(500).json({ message: "Erro ao eliminar o registo.", error: error.message });
      }
    },

    delete: null
  };

  controller.delete = controller.remove;
  return controller;
}

module.exports = createCrudController;
