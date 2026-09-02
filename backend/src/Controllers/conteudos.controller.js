const { certificacao_traducoes, conteudos, traducoes } = require("../Config/database");
const createCrudController = require("./crud.controller");
const { isUniqueError, requiredText } = require('../Services/validation.service');

const controller = createCrudController(conteudos, 'id_texto');

function validateContent(body) {
	return {
		chave: requiredText(body.chave, 'Content key', 100),
		texto: requiredText(body.texto, 'Content text', 20000)
	};
}

controller.create = async (req, res) => {
	try {
		return res.status(201).json(await conteudos.create(validateContent(req.body)));
	} catch (error) {
		return res.status(error.status || (isUniqueError(error) ? 409 : 500)).json({ message: error.message });
	}
};

controller.update = async (req, res) => {
	try {
		const record = await conteudos.findByPk(req.params.id_texto);
		if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
		await record.update(validateContent(req.body));
		if (record.chave === 'quality_certifications') await certificacao_traducoes.destroy({ where: {} });
		else await traducoes.destroy({ where: { id_texto: record.id_texto } });
		return res.status(200).json(record);
	} catch (error) {
		return res.status(error.status || (isUniqueError(error) ? 409 : 500)).json({ message: error.message });
	}
};

module.exports = controller;
