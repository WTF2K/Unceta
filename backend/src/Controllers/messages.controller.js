const { messages } = require("../Config/database");
const createCrudController = require("./crud.controller");
const { createValidationError, optionalText, requiredText } = require('../Services/validation.service');

const controller = createCrudController(messages, 'id_message');

controller.create = async (req, res) => {
	try {
		const email = requiredText(req.body.email, 'Email', 255).toLowerCase();
		if (!/^\S+@\S+\.\S+$/.test(email)) throw createValidationError('Email must be valid.');
		return res.status(201).json(await messages.create({
			nome: requiredText(req.body.nome, 'Name', 255),
			email,
			conteudo: requiredText(req.body.conteudo, 'Message', 10000)
		}));
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

controller.update = async (req, res) => {
	try {
		if (typeof req.body.lida !== 'boolean' || Object.keys(req.body).some((key) => key !== 'lida')) {
			throw createValidationError('Only a boolean read status may be updated.');
		}
		const record = await messages.findByPk(req.params.id_message);
		if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
		await record.update({ lida: req.body.lida });
		return res.status(200).json(record);
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

module.exports = controller;
