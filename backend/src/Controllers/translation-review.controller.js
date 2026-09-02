const { certificacao_traducoes, conteudos, linguas, noticia_traducoes, noticias, produto_traducoes, setor_traducoes } = require('../Config/database');

async function getLanguages() {
  return linguas.findAll({ where: { code: ['fr', 'de'] }, order: [['code', 'ASC']] });
}

async function getReviewData(req, res) {
  try {
    const [languages, news, newsTranslations, productTranslations, sectorTranslations, certificationTranslations, qualityContent] = await Promise.all([
      getLanguages(), noticias.findAll({ order: [['data_publicacao', 'DESC']] }), noticia_traducoes.findAll(), produto_traducoes.findAll(), setor_traducoes.findAll(), certificacao_traducoes.findAll()
      , conteudos.findOne({ where: { chave: 'quality_certifications' } })
    ]);
    let certifications = [];
    try { certifications = JSON.parse(qualityContent?.texto || '[]'); } catch (error) { certifications = []; }
    return res.status(200).json({ languages, news, newsTranslations, productTranslations, sectorTranslations, certificationTranslations, certifications });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load translations.', error: error.message });
  }
}

async function saveNewsTranslation(req, res) {
  try {
    const language = await linguas.findByPk(req.params.id_lingua);
    const newsItem = await noticias.findByPk(req.params.id_noticia);
    if (!language || !newsItem || !['fr', 'de'].includes(language.code) || typeof req.body.titulo !== 'string' || !req.body.titulo.trim()) return res.status(400).json({ message: 'A valid language, news item, and title are required.' });
    const [translation] = await noticia_traducoes.upsert({ id_lingua: language.id_lingua, id_noticia: newsItem.id_noticia, titulo: req.body.titulo.trim() }, { returning: true });
    return res.status(200).json(translation);
  } catch (error) { return res.status(500).json({ message: 'Unable to save news translation.', error: error.message }); }
}

async function saveCertificationTranslation(req, res) {
  try {
    const language = await linguas.findByPk(req.params.id_lingua);
    const indice = Number(req.params.indice);
    if (!language || !['fr', 'de'].includes(language.code) || !Number.isInteger(indice) || indice < 0 || typeof req.body.texto !== 'string' || !req.body.texto.trim()) return res.status(400).json({ message: 'A valid language, certification, and description are required.' });
    const [translation] = await certificacao_traducoes.upsert({ id_lingua: language.id_lingua, indice, texto: req.body.texto.trim() }, { returning: true });
    return res.status(200).json(translation);
  } catch (error) { return res.status(500).json({ message: 'Unable to save certification translation.', error: error.message }); }
}

module.exports = { getReviewData, saveNewsTranslation, saveCertificationTranslation };