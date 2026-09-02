const { conteudos, linguas, traducoes } = require('../Config/database');

async function translateText(text, targetLanguage) {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
  );

  if (!response.ok) throw new Error('Translation provider is unavailable.');
  const result = await response.json();
  const translation = result.responseData?.translatedText;

  if (!translation) throw new Error('Translation provider returned no translation.');
  return translation;
}

async function getTargetLanguages() {
  const targetLanguages = await linguas.findAll({ where: { code: ['fr', 'de'] } });
  if (targetLanguages.length !== 2) throw new Error('French and German must be configured first.');
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

    return res.status(200).json({ translatedContent: contentItems.length, languages: ['fr', 'de'] });
  } catch (error) {
    return res.status(502).json({ message: 'Automatic translation failed.', error: error.message });
  }
}

module.exports = { translateContent, translateAllContent };