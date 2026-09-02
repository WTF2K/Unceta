const { Op, fn, col } = require('sequelize');
const { mensagens, messages, produtos, setores, vistas_produto } = require("../Config/database");
const createCrudController = require("./crud.controller");

const controller = createCrudController(vistas_produto, 'id_vista');

async function recordProductView(req, res) {
	try {
		const product = await produtos.findByPk(req.params.id_prod);
		if (!product || product.ativo === false) return res.status(404).json({ message: 'Product not found.' });
		await vistas_produto.create({ id_prod: product.id_prod });
		return res.status(201).json({ id_prod: product.id_prod });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to record product view.' });
	}
}

async function getDashboardStats(req, res) {
	try {
		const messageModel = messages || mensagens;
		const viewWhere = {};
		const days = Number(req.query.days);
		if ([7, 30, 90].includes(days)) {
			viewWhere.data_vista = { [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
		}
		const [activeProducts, sectorCount, unreadMessages, recentMessages, productViews] = await Promise.all([
			produtos.count({ where: { ativo: { [Op.ne]: false } } }),
			setores.count(),
			messageModel.count({ where: { lida: false } }),
			messageModel.findAll({ order: [['data_envio', 'DESC']], limit: 5 }),
			vistas_produto.findAll({
				where: viewWhere,
				attributes: ['id_prod', [fn('COUNT', col('id_vista')), 'views']],
				include: [{
					model: produtos,
					as: 'id_prod_produto',
					attributes: ['nome'],
					include: [{ model: setores, as: 'id_setor_setore', attributes: ['nome'] }]
				}],
				group: ['vistas_produto.id_prod', 'id_prod_produto.id_prod', 'id_prod_produto->id_setor_setore.id_setor'],
				order: [[fn('COUNT', col('id_vista')), 'DESC']],
				limit: 5
			})
		]);
		return res.status(200).json({ activeProducts, sectorCount, unreadMessages, recentMessages, productViews });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load dashboard statistics.', error: error.message });
	}
}

module.exports = { ...controller, recordProductView, getDashboardStats };
