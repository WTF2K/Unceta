import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CONTENT_UPDATED_EVENT = 'unceta-content-updated';

export function notifyContentChanged() {
  window.localStorage.setItem(CONTENT_UPDATED_EVENT, String(Date.now()));
}

/**
 * Custom hook to fetch and manage page content from database
 * Used by both App.js and AdminPage.js to keep content in sync
 */
export function usePageContent(sourceLanguage = null) {
  const [contents, setContents] = useState({});
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [activeLanguage, setActiveLanguageState] = useState(() => window.localStorage.getItem('unceta-language') || 'en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();

    const handleContentUpdated = (event) => {
      if (event.key === CONTENT_UPDATED_EVENT) {
        fetchContent();
      }
      if (event.key === 'unceta-language' && event.newValue) {
        setActiveLanguageState(event.newValue);
      }
    };

    window.addEventListener('storage', handleContentUpdated);
    return () => window.removeEventListener('storage', handleContentUpdated);
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [contentResponse, languageResponse, translationResponse] = await Promise.all([
        fetch(`${API_URL}/conteudos`),
        fetch(`${API_URL}/linguas`),
        fetch(`${API_URL}/traducoes`)
      ]);
      if (!contentResponse.ok || !languageResponse.ok || !translationResponse.ok) {
        throw new Error('Failed to fetch page content');
      }

      const [data, languageData, translationData] = await Promise.all([
        contentResponse.json(),
        languageResponse.json(),
        translationResponse.json()
      ]);
      const contentMap = {};
      
      // Map content by key for easy access
      data.forEach(item => {
        contentMap[item.chave] = item;
      });
      const translationMap = {};
      translationData.forEach((translation) => {
        translationMap[`${translation.id_lingua}:${translation.id_texto}`] = translation.texto_trad;
      });
      setContents(contentMap);
      setLanguages(languageData);
      setTranslations(translationMap);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get content text by key, with fallback to default
   * @param {string} key - Content key (e.g., 'hero_title')
   * @param {string} defaultText - Fallback text if key not found
   * @returns {string} Content text or default
   */
  const getContent = (key, defaultText = '') => {
    const content = contents[key];
    const language = languages.find((item) => item.code === (sourceLanguage || activeLanguage));
    const translation = language && content ? translations[`${language.id_lingua}:${content.id_texto}`] : null;
    return translation || content?.texto || defaultText;
  };

  const setActiveLanguage = (languageCode) => {
    setActiveLanguageState(languageCode);
    window.localStorage.setItem('unceta-language', languageCode);
  };

  /**
   * Refresh content from database
   */
  const refreshContent = () => {
    fetchContent();
  };

  return {
    contents,
    languages,
    activeLanguage,
    setActiveLanguage,
    getContent,
    isLoading,
    error,
    refreshContent
  };
}
