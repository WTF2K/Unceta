const { certificacao_traducoes, conteudos, linguas, noticia_traducoes, noticias } = require('../Config/database');

async function translateText(text, language) {
  const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${language}`);
  if (!response.ok) throw new Error('Translation provider is unavailable.');
  const data = await response.json();
  if (!data.responseData?.translatedText) throw new Error('Translation provider returned no translation.');
  return data.responseData.translatedText;
}

async function getLanguages() {
  const languages = await linguas.findAll({ where: { code: ['fr', 'de'] } });
  if (languages.length !== 2) throw new Error('French and German must be configured first.');
  return languages;
}

async function getCertificationList() {
  const content = await conteudos.findOne({ where: { chave: 'quality_certifications' } });
  try { return Array.isArray(JSON.parse(content?.texto || '[]')) ? JSON.parse(content.texto) : []; } catch (error) { return []; }
}

async function translateDynamicContent(req, res) {
  try {
    const [languages, newsItems, certifications] = await Promise.all([getLanguages(), noticias.findAll(), getCertificationList()]);
    for (const language of languages) {
      for (const item of newsItems) {
        await noticia_traducoes.upsert({ id_lingua: language.id_lingua, id_noticia: item.id_noticia, titulo: await translateText(item.titulo, language.code) });
      }
      for (const [indice, certification] of certifications.entries()) {
        await certificacao_traducoes.upsert({ id_lingua: language.id_lingua, indice, texto: await translateText(certification.text, language.code) });
      }
    }
    return res.status(200).json({ news: newsItems.length, certifications: certifications.length });
  } catch (error) { return res.status(502).json({ message: 'Automatic dynamic translation failed.', error: error.message }); }
}

async function getPublicDynamicTranslations(req, res) {
  try {
    const [news, certifications] = await Promise.all([noticia_traducoes.findAll(), certificacao_traducoes.findAll()]);
    return res.status(200).json({ news, certifications });
  } catch (error) { return res.status(500).json({ message: 'Unable to load dynamic translations.', error: error.message }); }
}

module.exports = { getPublicDynamicTranslations, translateDynamicContent };