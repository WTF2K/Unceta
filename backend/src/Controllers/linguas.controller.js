const { certificacao_traducoes, linguas, noticia_traducoes, produto_traducoes, setor_traducoes, traducoes } = require("../Config/database");
const createCrudController = require("./crud.controller");

const controller = createCrudController(linguas, "id_lingua");

controller.remove = async (req, res) => {
	try {
		const language = await linguas.findByPk(req.params.id_lingua);
		if (!language) return res.status(404).json({ message: 'Idioma não encontrado.' });
		if (language.code === 'en') return res.status(400).json({ message: 'O idioma inglês não pode ser eliminado.' });

		await Promise.all([
			traducoes.destroy({ where: { id_lingua: language.id_lingua } }),
			produto_traducoes.destroy({ where: { id_lingua: language.id_lingua } }),
			setor_traducoes.destroy({ where: { id_lingua: language.id_lingua } }),
			noticia_traducoes.destroy({ where: { id_lingua: language.id_lingua } }),
			certificacao_traducoes.destroy({ where: { id_lingua: language.id_lingua } })
		]);
		await language.destroy();
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Erro ao eliminar o idioma.', error: error.message });
	}
};

controller.delete = controller.remove;
module.exports = controller;
