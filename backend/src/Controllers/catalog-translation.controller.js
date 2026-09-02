const { linguas, produto_traducoes, produtos, setor_traducoes, setores } = require('../Config/database');

async function translateText(text, targetLanguage) {
  if (!text) return '';
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
  );
  if (!response.ok) throw new Error('Translation provider is unavailable.');
  const result = await response.json();
  if (!result.responseData?.translatedText) throw new Error('Translation provider returned no translation.');
  return result.responseData.translatedText;
}

async function getTargetLanguages() {
  const languages = await linguas.findAll({ where: { code: ['fr', 'de'] } });
  if (languages.length !== 2) throw new Error('French and German must be configured first.');
  return languages;
}

async function translateAllCatalog(req, res) {
  try {
    const [targetLanguages, productItems, sectorItems] = await Promise.all([
      getTargetLanguages(),
      produtos.findAll(),
      setores.findAll()
    ]);

    for (const language of targetLanguages) {
      for (const product of productItems) {
        await produto_traducoes.upsert({
          id_lingua: language.id_lingua,
          id_prod: product.id_prod,
          nome: await translateText(product.nome, language.code),
          descricao: await translateText(product.descricao, language.code)
        });
      }
      for (const sector of sectorItems) {
        await setor_traducoes.upsert({
          id_lingua: language.id_lingua,
          id_setor: sector.id_setor,
          nome: await translateText(sector.nome, language.code),
          descricao: await translateText(sector.descricao, language.code)
        });
      }
    }

    return res.status(200).json({ products: productItems.length, sectors: sectorItems.length, languages: ['fr', 'de'] });
  } catch (error) {
    return res.status(502).json({ message: 'Automatic catalog translation failed.', error: error.message });
  }
}

async function getCatalogTranslations(req, res) {
  try {
    const [products, sectors] = await Promise.all([produto_traducoes.findAll(), setor_traducoes.findAll()]);
    return res.status(200).json({ products, sectors });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load catalog translations.', error: error.message });
  }
}

module.exports = { getCatalogTranslations, translateAllCatalog };