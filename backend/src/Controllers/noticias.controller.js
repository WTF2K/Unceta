const { noticia_traducoes, noticias } = require('../Config/database');
const createCrudController = require('./crud.controller');
const { removeImageIfUnused } = require('../Services/upload-cleanup.service');
const { createValidationError, imageUrl, optionalText, requiredText } = require('../Services/validation.service');

const controller = createCrudController(noticias, 'id_noticia');

function validateNews(body) {
	if (body.ativa !== undefined && typeof body.ativa !== 'boolean') {
		throw createValidationError('Published must be true or false.');
	}
	const link = optionalText(body.link, 'News link', 2000);
	if (link && !/^https?:\/\//.test(link) && !link.startsWith('/')) {
		throw createValidationError('News link must be a valid URL or site path.');
	}
	return {
		titulo: requiredText(body.titulo, 'News title', 255),
		imagem: imageUrl(body.imagem),
		link: link || '#',
		data_publicacao: body.data_publicacao || undefined,
		ativa: body.ativa === undefined ? true : body.ativa
	};
}

controller.create = async (req, res) => {
	try {
		return res.status(201).json(await noticias.create(validateNews(req.body)));
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

controller.update = async (req, res) => {
	try {
		const record = await noticias.findByPk(req.params.id_noticia);
		if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
		const previousImage = record.imagem;
		await record.update(validateNews(req.body));
		await noticia_traducoes.destroy({ where: { id_noticia: record.id_noticia } });
		if (previousImage && previousImage !== record.imagem) await removeImageIfUnused(previousImage);
		return res.status(200).json(record);
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

async function updatePublishState(req, res) {
	try {
		if (typeof req.body.ativa !== 'boolean') {
			throw createValidationError('Published must be true or false.');
		}
		const record = await noticias.findByPk(req.params.id_noticia);
		if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
		await record.update({ ativa: req.body.ativa });
		return res.status(200).json(record);
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
}

controller.remove = async (req, res) => {
	try {
		const record = await noticias.findByPk(req.params.id_noticia);
		if (!record) return res.status(404).json({ message: 'Registo não encontrado.' });
		const imageUrl = record.imagem;
		await noticia_traducoes.destroy({ where: { id_noticia: record.id_noticia } });
		await record.destroy();
		await removeImageIfUnused(imageUrl);
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
controller.delete = controller.remove;

module.exports = { ...controller, updatePublishState };
