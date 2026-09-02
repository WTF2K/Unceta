const { traducoes } = require("../Config/database");

function getWhere(req) {
  return {
    id_lingua: req.params.id_lingua,
    id_texto: req.params.id_texto
  };
}

async function findOneRecord(req) {
  return traducoes.findOne({ where: getWhere(req) });
}

async function create(req, res) {
  try {
    const record = await traducoes.create(req.body);
    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar o registo.", error: error.message });
  }
}

async function findAll(req, res) {
  try {
    const records = await traducoes.findAll();
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter os registos.", error: error.message });
  }
}

async function findOne(req, res) {
  try {
    const record = await findOneRecord(req);
    if (!record) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter o registo.", error: error.message });
  }
}

async function update(req, res) {
  try {
    const record = await findOneRecord(req);
    if (!record) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }
    await record.update(req.body);
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar o registo.", error: error.message });
  }
}

async function remove(req, res) {
  try {
    const record = await findOneRecord(req);
    if (!record) {
      return res.status(404).json({ message: "Registo não encontrado." });
    }
    await record.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao eliminar o registo.", error: error.message });
  }
}

module.exports = { create, findAll, findOne, update, remove, delete: remove };
