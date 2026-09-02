const createCrudController = require('./crud.controller');
const { setores } = require('../Config/database');
const { removeImageIfUnused } = require('../Services/upload-cleanup.service');
const { createValidationError, imageUrl, isUniqueError, optionalText, requiredText } = require('../Services/validation.service');

async function validatePayload(primaryKey, body) {
  if (primaryKey === 'id_prod') {
    const sectorId = Number(body.id_setor);
    if (!Number.isInteger(sectorId) || sectorId <= 0 || !(await setores.findByPk(sectorId))) {
      throw createValidationError('A valid sector is required for this product.');
    }
    if (body.ativo !== undefined && typeof body.ativo !== 'boolean') throw createValidationError('Active must be true or false.');
    return {
      id_setor: sectorId,
      nome: requiredText(body.nome, 'Product name', 255),
      descricao: optionalText(body.descricao, 'Product description', 10000),
      imagem: imageUrl(body.imagem),
      ativo: body.ativo === undefined ? true : body.ativo
    };
  }

  return {
    nome: requiredText(body.nome, 'Sector name', 255),
    descricao: optionalText(body.descricao, 'Sector description', 10000),
    imagem: imageUrl(body.imagem)
  };
}

function createCatalogCrudController(Model, TranslationModel, primaryKey) {
  const controller = createCrudController(Model, primaryKey);

  controller.create = async (req, res) => {
    try {
      return res.status(201).json(await Model.create(await validatePayload(primaryKey, req.body)));
    } catch (error) {
      return res.status(error.status || (isUniqueError(error) ? 409 : 500)).json({ message: error.message });
    }
  };

  controller.update = async (req, res) => {
    try {
      const record = await Model.findByPk(req.params[primaryKey]);
      if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });

      const previousImage = record.imagem;
      await record.update(await validatePayload(primaryKey, req.body));
      await TranslationModel.destroy({ where: { [primaryKey]: record[primaryKey] } });
      if (previousImage && previousImage !== record.imagem) await removeImageIfUnused(previousImage);
      return res.status(200).json(record);
    } catch (error) {
      return res.status(error.status || (isUniqueError(error) ? 409 : 500)).json({ message: error.message });
    }
  };

  controller.remove = async (req, res) => {
    try {
      const record = await Model.findByPk(req.params[primaryKey]);
      if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });

      if (primaryKey === 'id_setor' && await Model.sequelize.models.produtos.count({ where: { id_setor: record.id_setor } })) {
        return res.status(409).json({ message: 'This sector cannot be deleted while products are assigned to it.' });
      }

      const imageUrl = record.imagem;
      await TranslationModel.destroy({ where: { [primaryKey]: record[primaryKey] } });
      await record.destroy();
      await removeImageIfUnused(imageUrl);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao eliminar o registo.', error: error.message });
    }
  };
  controller.delete = controller.remove;
  return controller;
}

module.exports = createCatalogCrudController;