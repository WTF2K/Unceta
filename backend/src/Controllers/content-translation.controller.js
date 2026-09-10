const { conteudos, linguas, traducoes } = require('../Config/database');
const { Op } = require('sequelize');
const { translateText } = require('../Services/translation.service');

async function getTargetLanguages() {
  const targetLanguages = await linguas.findAll({ where: { code: { [Op.ne]: 'en' } }, order: [['code', 'ASC']] });
  if (targetLanguages.length === 0) throw new Error('At least one target language must be configured.');
  return targetLanguages;
}

async function translateRecord(content, targetLanguages) {
  const savedTranslations = [];
  for (const language of targetLanguages) {
    const texto_trad = await translateText(content.texto, language.code);
    const [translation] = await traducoes.upsert({
      id_lingua: language.id_lingua,
      id_texto: content.id_texto,
      texto_trad
    }, { returning: true });
    savedTranslations.push({ code: language.code, texto_trad: translation.texto_trad });
  }
  return savedTranslations;
}

async function translateContent(req, res) {
  try {
    const content = await conteudos.findByPk(req.params.id_texto);
    if (!content) return res.status(404).json({ message: 'Content not found.' });

    const savedTranslations = await translateRecord(content, await getTargetLanguages());

    return res.status(200).json({ id_texto: content.id_texto, translations: savedTranslations });
  } catch (error) {
    return res.status(502).json({ message: 'Automatic translation failed.', error: error.message });
  }
}

async function translateAllContent(req, res) {
  try {
    const [contentItems, targetLanguages] = await Promise.all([
      conteudos.findAll({ order: [['id_texto', 'ASC']] }).then((items) => items.filter((content) => !content.chave.includes('_image') && content.chave !== 'quality_certifications')),
      getTargetLanguages()
    ]);

    for (const content of contentItems) {
      await translateRecord(content, targetLanguages);
    }

    return res.status(200).json({ translatedContent: contentItems.length, languages: targetLanguages.map((language) => language.code) });
  } catch (error) {
    return res.status(502).json({ message: 'Automatic translation failed.', error: error.message });
  }
}

module.exports = { translateContent, translateAllContent };