const TRANSLATION_ENDPOINT = 'https://api.mymemory.translated.net/get';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function translateText(text, targetLanguage) {
  if (!text) return '';

  const parameters = new URLSearchParams({ q: text, langpair: `en|${targetLanguage}` });
  if (process.env.MYMEMORY_EMAIL) parameters.set('de', process.env.MYMEMORY_EMAIL);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${TRANSLATION_ENDPOINT}?${parameters}`);
    const result = await response.json().catch(() => ({}));
    const translation = result.responseData?.translatedText;

    if (response.ok && translation) return translation;

    const providerMessage = result.responseDetails || result.error?.message || `Translation provider returned HTTP ${response.status}.`;
    if (attempt === 2 || ![429, 500, 502, 503, 504].includes(response.status)) throw new Error(providerMessage);
    await delay(1000 * (attempt + 1));
  }
}

module.exports = { translateText };