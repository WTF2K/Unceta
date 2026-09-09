const { certificacao_traducoes, conteudos, linguas, noticia_traducoes, noticias, produto_traducoes, produtos, setor_traducoes, setores } = require('../Config/database');
const { Op } = require('sequelize');

async function getLanguages() {
  return linguas.findAll({ where: { code: { [Op.ne]: 'en' } }, order: [['code', 'ASC']] });
}

async function getReviewData(req, res) {
  try {
    const [languages, news, newsTranslations, productTranslations, sectorTranslations, certificationTranslations, products, sectors, qualityContent] = await Promise.all([
      getLanguages(), noticias.findAll({ order: [['data_publicacao', 'DESC']] }), noticia_traducoes.findAll(), produto_traducoes.findAll(), setor_traducoes.findAll(), certificacao_traducoes.findAll(), produtos.findAll(), setores.findAll()
      , conteudos.findOne({ where: { chave: 'quality_certifications' } })
    ]);
    let certifications = [];
    try { certifications = JSON.parse(qualityContent?.texto || '[]'); } catch (error) { certifications = []; }
    return res.status(200).json({ languages, news, newsTranslations, productTranslations, sectorTranslations, certificationTranslations, products, sectors, certifications });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load translations.', error: error.message });
  }
}

async function saveNewsTranslation(req, res) {
  try {
    const language = await linguas.findByPk(req.params.id_lingua);
    const newsItem = await noticias.findByPk(req.params.id_noticia);
    if (!language || language.code === 'en' || !newsItem || typeof req.body.titulo !== 'string' || !req.body.titulo.trim()) return res.status(400).json({ message: 'A valid target language, news item, and title are required.' });
    const [translation] = await noticia_traducoes.upsert({ id_lingua: language.id_lingua, id_noticia: newsItem.id_noticia, titulo: req.body.titulo.trim() }, { returning: true });
    return res.status(200).json(translation);
  } catch (error) { return res.status(500).json({ message: 'Unable to save news translation.', error: error.message }); }
}

async function saveCertificationTranslation(req, res) {
  try {
    const language = await linguas.findByPk(req.params.id_lingua);
    const indice = Number(req.params.indice);
    if (!language || language.code === 'en' || !Number.isInteger(indice) || indice < 0 || typeof req.body.texto !== 'string' || !req.body.texto.trim()) return res.status(400).json({ message: 'A valid target language, certification, and description are required.' });
    const [translation] = await certificacao_traducoes.upsert({ id_lingua: language.id_lingua, indice, texto: req.body.texto.trim() }, { returning: true });
    return res.status(200).json(translation);
  } catch (error) { return res.status(500).json({ message: 'Unable to save certification translation.', error: error.message }); }
}

async function saveCatalogTranslation(req, res, Model, ParentModel, primaryKey) {
  try {
    const language = await linguas.findByPk(req.params.id_lingua);
    const item = await ParentModel.findByPk(req.params[primaryKey]);
    if (!language || language.code === 'en' || !item || typeof req.body.nome !== 'string' || !req.body.nome.trim()) return res.status(400).json({ message: 'A valid target language, item, and name are required.' });
    const [translation] = await Model.upsert({ id_lingua: language.id_lingua, [primaryKey]: item[primaryKey], nome: req.body.nome.trim(), descricao: typeof req.body.descricao === 'string' ? req.body.descricao.trim() : '' }, { returning: true });
    return res.status(200).json(translation);
  } catch (error) { return res.status(500).json({ message: 'Unable to save catalog translation.', error: error.message }); }
}

async function saveProductTranslation(req, res) {
  return saveCatalogTranslation(req, res, produto_traducoes, produtos, 'id_prod');
}

async function saveSectorTranslation(req, res) {
  return saveCatalogTranslation(req, res, setor_traducoes, setores, 'id_setor');
}

module.exports = { getReviewData, saveNewsTranslation, saveCertificationTranslation, saveProductTranslation, saveSectorTranslation };