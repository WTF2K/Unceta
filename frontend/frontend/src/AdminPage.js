import React, { useCallback, useState, useEffect } from 'react';
import { notifyContentChanged, usePageContent } from './hooks/usePageContent';
import './AdminPage.css';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
const adminFetch = (url, options = {}) => window.fetch(url, { credentials: 'include', ...options });

function ContentEditorModal({ isLoading, isOpen, value, onCancel, onChange, onSave }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h3>Editar Conteúdo</h3>
        <textarea
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows="8"
          style={{ width: '100%', padding: '12px 15px', border: '1px solid #dbe3ed', borderRadius: '6px', fontFamily: 'inherit', fontSize: '1rem' }}
        />
        <div className="modal-actions">
          <button className="btn-save" onClick={onSave} disabled={isLoading}>Guardar</button>
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ImageEditorModal({ isLoading, isOpen, onCancel, onUpload }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h3>Editar imagem</h3>
        <div className="form-group">
          <label htmlFor="site-image">Selecionar imagem</label>
          <input id="site-image" type="file" accept="image/*" onChange={(event) => onUpload(event.target.files[0])} disabled={isLoading} />
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function NewsEditorModal({ isLoading, news, onCancel, onChange, onSave, onUpload }) {
  if (!news) return null;

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h3>{news.id_noticia ? 'Editar notícia' : 'Nova notícia'}</h3>
        <div className="form-group"><label htmlFor="news-title">Título</label><input id="news-title" value={news.titulo} onChange={(event) => onChange({ titulo: event.target.value })} required /></div>
        <div className="form-group"><label htmlFor="news-link">Ligação</label><input id="news-link" type="url" value={news.link} onChange={(event) => onChange({ link: event.target.value })} placeholder="https://..." /></div>
        <div className="form-group"><label htmlFor="news-date">Data de publicação</label><input id="news-date" type="datetime-local" value={news.data_publicacao} onChange={(event) => onChange({ data_publicacao: event.target.value })} /></div>
        <div className="form-group"><label htmlFor="news-image">Imagem</label><input id="news-image" type="file" accept="image/*" onChange={(event) => onUpload(event.target.files[0])} disabled={isLoading} />{news.imagem && <img className="image-preview" src={news.imagem} alt="Pré-visualização da notícia" />}</div>
        <div className="form-group checkbox"><label><input type="checkbox" checked={news.ativa} onChange={(event) => onChange({ ativa: event.target.checked })} />Publicada</label></div>
        <div className="modal-actions"><button className="btn-save" onClick={onSave} disabled={isLoading}>Guardar notícia</button><button className="btn-cancel" onClick={onCancel}>Cancelar</button></div>
      </div>
    </div>
  );
}

function CertificationEditorModal({ certification, isLoading, onCancel, onChange, onSave, onUpload }) {
  if (!certification) return null;

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h3>{certification.index === null ? 'Nova certificação' : 'Editar certificação'}</h3>
        <div className="form-group"><label htmlFor="certification-image">Imagem</label><input id="certification-image" type="file" accept="image/*" onChange={(event) => onUpload(event.target.files[0])} disabled={isLoading} required={!certification.image} />{certification.image && <img className="image-preview certification-image-preview" src={certification.image} alt="Pré-visualização da certificação" />}</div>
        <div className="modal-actions"><button className="btn-save" onClick={onSave} disabled={isLoading}>Guardar</button><button className="btn-cancel" onClick={onCancel}>Cancelar</button></div>
      </div>
    </div>
  );
}

function ProductEditorModal({ isLoading, product, sectors, onCancel, onChange, onDelete, onSave, onUpload }) {
  if (!product) return null;

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h3>Editar Produto</h3>
        <div className="form-group"><label>Nome</label><input type="text" value={product.nome} onChange={(event) => onChange({ nome: event.target.value })} /></div>
        <div className="form-group"><label>Setor</label><select value={product.id_setor} onChange={(event) => onChange({ id_setor: event.target.value })}><option value="">Selecione um setor</option>{sectors.map((sector) => <option key={sector.id_setor} value={sector.id_setor}>{sector.nome}</option>)}</select></div>
        <div className="form-group"><label>Descrição</label><textarea value={product.descricao || ''} onChange={(event) => onChange({ descricao: event.target.value })} rows="4" /></div>
        <div className="form-group"><label>Imagem</label><input type="file" accept="image/*" onChange={onUpload} />{product.imagem && <img src={product.imagem} alt="Preview" className="image-preview" />}</div>
        <div className="form-group checkbox"><label><input type="checkbox" checked={product.ativo} onChange={(event) => onChange({ ativo: event.target.checked })} />Ativo</label></div>
        <div className="modal-actions"><button className="btn-save" onClick={onSave} disabled={isLoading}>{product.id_prod ? 'Guardar' : 'Criar Produto'}</button>{product.id_prod && <button className="btn-delete" onClick={() => onDelete(product.id_prod)} disabled={isLoading}>Eliminar Produto</button>}<button className="btn-cancel" onClick={onCancel}>Cancelar</button></div>
      </div>
    </div>
  );
}

function TranslationReviewModal({ review, drafts, isLoading, onCancel, onChange, onSave }) {
  if (!review) return null;
  const getNewsKey = (newsId, languageId) => `news:${newsId}:${languageId}`;
  const getCatalogKey = (type, itemId, languageId) => `${type}:${itemId}:${languageId}`;
  const existingNews = (newsId, languageId) => review.newsTranslations.find((item) => item.id_noticia === newsId && item.id_lingua === languageId)?.titulo || '';
  const existingCatalog = (type, itemId, languageId) => {
    const translations = type === 'product' ? review.productTranslations : review.sectorTranslations;
    const key = type === 'product' ? 'id_prod' : 'id_setor';
    return translations.find((item) => item[key] === itemId && item.id_lingua === languageId) || {};
  };

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content translation-review-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Rever traduções</h3>
        <h4>Notícias</h4>
        {review.news.map((item) => review.languages.map((language) => {
          const key = getNewsKey(item.id_noticia, language.id_lingua);
          return <div className="translation-review-row" key={key}><label>{language.code.toUpperCase()} · {item.titulo}</label><input value={drafts[key] ?? existingNews(item.id_noticia, language.id_lingua)} placeholder="Em falta" onChange={(event) => onChange(key, event.target.value)} /><button onClick={() => onSave('news', item.id_noticia, language.id_lingua, drafts[key] ?? existingNews(item.id_noticia, language.id_lingua))} disabled={isLoading}>Guardar</button></div>;
        }))}
        <h4>Produtos</h4>
        {review.products.map((item) => review.languages.map((language) => {
          const translation = existingCatalog('product', item.id_prod, language.id_lingua);
          const key = getCatalogKey('product', item.id_prod, language.id_lingua);
          return <div className="translation-review-row catalog-translation-row" key={key}><label>{language.code.toUpperCase()} · {item.nome}</label><input value={drafts[key] ?? translation.nome ?? ''} placeholder="Nome traduzido" onChange={(event) => onChange(key, event.target.value)} /><textarea value={drafts[`${key}:description`] ?? translation.descricao ?? ''} placeholder="Descrição traduzida" onChange={(event) => onChange(`${key}:description`, event.target.value)} /><button onClick={() => onSave('product', item.id_prod, language.id_lingua, drafts[key] ?? translation.nome ?? '', drafts[`${key}:description`] ?? translation.descricao ?? '')} disabled={isLoading}>Guardar</button></div>;
        }))}
        <h4>Setores</h4>
        {review.sectors.map((item) => review.languages.map((language) => {
          const translation = existingCatalog('sector', item.id_setor, language.id_lingua);
          const key = getCatalogKey('sector', item.id_setor, language.id_lingua);
          return <div className="translation-review-row catalog-translation-row" key={key}><label>{language.code.toUpperCase()} · {item.nome}</label><input value={drafts[key] ?? translation.nome ?? ''} placeholder="Nome traduzido" onChange={(event) => onChange(key, event.target.value)} /><textarea value={drafts[`${key}:description`] ?? translation.descricao ?? ''} placeholder="Descrição traduzida" onChange={(event) => onChange(`${key}:description`, event.target.value)} /><button onClick={() => onSave('sector', item.id_setor, language.id_lingua, drafts[key] ?? translation.nome ?? '', drafts[`${key}:description`] ?? translation.descricao ?? '')} disabled={isLoading}>Guardar</button></div>;
        }))}
        <div className="modal-actions"><button className="btn-cancel" onClick={onCancel}>Fechar</button></div>
      </div>
    </div>
  );
}

function LanguageManagerModal({ languages, contents, translationRecords, selectedLanguageId, newLanguage, isLoading, onCancel, onSelectLanguage, onNewLanguageChange, onCreateLanguage, onSaveTranslation, onDeleteLanguage }) {
  const targetLanguages = languages.filter((language) => language.code !== 'en');
  const contentItems = Object.values(contents).filter((content) => !content.chave.includes('_image'));
  const getTranslation = (contentId) => translationRecords.find((translation) => translation.id_lingua === Number(selectedLanguageId) && translation.id_texto === contentId)?.texto_trad || '';

  return (
    <div className="modal-overlay active" onClick={onCancel}>
      <div className="modal-content language-manager-modal" onClick={(event) => event.stopPropagation()}>
        <h3>Idiomas e traduções</h3>
        <form className="language-create-form" onSubmit={onCreateLanguage}>
          <input aria-label="Código do idioma" maxLength="10" placeholder="Código (ex.: es)" value={newLanguage.code} onChange={(event) => onNewLanguageChange({ ...newLanguage, code: event.target.value })} required />
          <input aria-label="Nome do idioma" placeholder="Nome (ex.: Español)" value={newLanguage.nome} onChange={(event) => onNewLanguageChange({ ...newLanguage, nome: event.target.value })} required />
          <button className="btn-save" type="submit" disabled={isLoading}>Adicionar idioma</button>
        </form>
        {targetLanguages.length === 0 ? <p>Adicione o primeiro idioma de destino.</p> : <div className="language-manager-list">{targetLanguages.map((language) => <div className="language-manager-item" key={language.id_lingua}><button className={`language-manager-choice ${String(selectedLanguageId) === String(language.id_lingua) ? 'active' : ''}`} onClick={() => onSelectLanguage(String(language.id_lingua))}>{language.nome} ({language.code.toUpperCase()})</button><button className="language-manager-delete" onClick={() => onDeleteLanguage(language)} disabled={isLoading} aria-label={`Eliminar ${language.nome}`}>Eliminar</button></div>)}</div>}
        {selectedLanguageId && <div className="translation-content-list">{contentItems.map((content) => <div className="translation-content-row" key={content.id_texto}><label htmlFor={`translation-${content.id_texto}`}>{content.chave}</label><textarea key={`${selectedLanguageId}-${content.id_texto}`} id={`translation-${content.id_texto}`} defaultValue={getTranslation(content.id_texto)} rows="2" placeholder="Tradução em falta" /><button className="btn-save" onClick={(event) => onSaveTranslation(event, content, event.currentTarget.previousElementSibling.value)} disabled={isLoading}>Guardar</button></div>)}</div>}
        <div className="modal-actions"><button className="btn-cancel" onClick={onCancel}>Fechar</button></div>
      </div>
    </div>
  );
}

function AdminPage() {
  const { contents, languages, translationRecords, getContent, refreshContent } = usePageContent('en');
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [products, setProducts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [news, setNews] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productStatus, setProductStatus] = useState('all');
  const [messageFilter, setMessageFilter] = useState('all');
  const [viewRange, setViewRange] = useState('all');

  // Content editing states
  const [editingContent, setEditingContent] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [productEdit, setProductEdit] = useState(null);
  const [sectorEdit, setSectorEdit] = useState(null);
  const [editingImageKey, setEditingImageKey] = useState(null);
  const [newsEdit, setNewsEdit] = useState(null);
  const [certificationEdit, setCertificationEdit] = useState(null);
  const [translationReview, setTranslationReview] = useState(null);
  const [translationDrafts, setTranslationDrafts] = useState({});
  const [sectorReassignment, setSectorReassignment] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLanguageManagerOpen, setIsLanguageManagerOpen] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState('');
  const [newLanguage, setNewLanguage] = useState({ code: '', nome: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmation: '' });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsRes, sectorsRes] = await Promise.all([
        adminFetch(`${API_URL}/produtos`),
        adminFetch(`${API_URL}/setores`)
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (sectorsRes.ok) setSectors(await sectorsRes.json());
    } catch (error) {
      showMessage('Erro ao carregar dados', 'error');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await adminFetch(`${API_URL}/messages`);
      if (!response.ok) throw new Error('Erro ao carregar mensagens');
      setMessages(await response.json());
    } catch (error) {
      console.error('Message loading error:', error);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const response = await adminFetch(`${API_URL}/noticias`);
      if (!response.ok) throw new Error('Erro ao carregar notícias');
      setNews(await response.json());
    } catch (error) {
      console.error('News loading error:', error);
    }
  }, []);

  const fetchDashboard = useCallback(async (range = viewRange) => {
    try {
      const query = range === 'all' ? '' : `?days=${range}`;
      const response = await adminFetch(`${API_URL}/dashboard${query}`);
      if (!response.ok) throw new Error('Erro ao carregar resumo');
      setDashboard(await response.json());
    } catch (error) {
      console.error('Dashboard loading error:', error);
    }
  }, [viewRange]);

  useEffect(() => {
    fetchProducts();
    fetchMessages();
    fetchNews();
    fetchDashboard();
  }, [fetchProducts, fetchMessages, fetchNews, fetchDashboard]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const startEditingContent = (key, currentValue) => {
    setEditingContent(key);
    setEditValue(currentValue);
  };

  const qualityCertifications = (() => {
    try {
      const certifications = JSON.parse(getContent('quality_certifications', '[]'));
      return Array.isArray(certifications) ? certifications : [];
    } catch (error) {
      return [];
    }
  })();

  const saveCertifications = async (certifications) => {
    const saved = await saveContent('quality_certifications', JSON.stringify(certifications));
    if (saved) setCertificationEdit(null);
  };

  const saveCertification = async () => {
    const { index, image } = certificationEdit;
    if (!image) {
      showMessage('Selecione uma imagem para a certificação.', 'error');
      return;
    }
    const certifications = [...qualityCertifications];
    const certification = { image };
    if (index === null) certifications.push(certification);
    else certifications[index] = certification;
    await saveCertifications(certifications);
  };

  const deleteCertification = async (index) => {
    await saveCertifications(qualityCertifications.filter((_, certificationIndex) => certificationIndex !== index));
  };

  const openTranslationReview = async () => {
    try {
      const response = await adminFetch(`${API_URL}/translation-review`);
      if (!response.ok) throw new Error('Erro ao carregar traduções');
      setTranslationDrafts({});
      setTranslationReview(await response.json());
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const saveReviewedTranslation = async (type, recordId, languageId, value, description = '') => {
    if (!value.trim()) {
      showMessage('A tradução não pode estar vazia.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const route = type === 'news'
        ? `${API_URL}/translation-review/news/${recordId}/${languageId}`
        : type === 'product'
          ? `${API_URL}/translation-review/products/${recordId}/${languageId}`
          : type === 'sector'
            ? `${API_URL}/translation-review/sectors/${recordId}/${languageId}`
            : `${API_URL}/translation-review/certifications/${recordId}/${languageId}`;
      const response = await adminFetch(route, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'news' ? { titulo: value } : type === 'product' || type === 'sector' ? { nome: value, descricao: description } : { texto: value })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao guardar tradução');
      setTranslationDrafts((drafts) => ({ ...drafts, [`${type}:${recordId}:${languageId}`]: value }));
      showMessage('Tradução guardada.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createLanguage = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await adminFetch(`${API_URL}/linguas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: newLanguage.code.trim().toLowerCase(), nome: newLanguage.nome.trim() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao adicionar idioma');
      setNewLanguage({ code: '', nome: '' });
      setSelectedLanguageId(String(result.id_lingua));
      await refreshContent();
      showMessage('Idioma adicionado.', 'success');
    } catch (error) { showMessage(error.message, 'error'); } finally { setIsLoading(false); }
  };

  const deleteLanguage = async (language) => {
    if (!window.confirm(`Eliminar o idioma ${language.nome} e todas as suas traduções?`)) return;
    setIsLoading(true);
    try {
      const response = await adminFetch(`${API_URL}/linguas/${language.id_lingua}`, { method: 'DELETE' });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Erro ao eliminar idioma');
      }
      if (String(selectedLanguageId) === String(language.id_lingua)) setSelectedLanguageId('');
      await refreshContent();
      showMessage('Idioma eliminado.', 'success');
    } catch (error) { showMessage(error.message, 'error'); } finally { setIsLoading(false); }
  };

  const saveContentTranslation = async (event, content, value) => {
    event.preventDefault();
    if (!value.trim()) { showMessage('A tradução não pode estar vazia.', 'error'); return; }
    setIsLoading(true);
    try {
      const existing = translationRecords.find((translation) => translation.id_lingua === Number(selectedLanguageId) && translation.id_texto === content.id_texto);
      const response = await adminFetch(existing ? `${API_URL}/traducoes/${selectedLanguageId}/${content.id_texto}` : `${API_URL}/traducoes`, { method: existing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(existing ? { texto_trad: value.trim() } : { id_lingua: Number(selectedLanguageId), id_texto: content.id_texto, texto_trad: value.trim() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao guardar tradução');
      await refreshContent();
      showMessage('Tradução guardada.', 'success');
    } catch (error) { showMessage(error.message, 'error'); } finally { setIsLoading(false); }
  };

  const saveContent = async (key, value) => {
    if (!value || !value.trim()) {
      showMessage('Conteúdo não pode estar vazio', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving content:', { key, value });
      const contentItem = contents[key];
      
      if (contentItem) {
        // Update existing
        console.log(`Updating content with ID: ${contentItem.id_texto}`);
        const url = `${API_URL}/conteudos/${contentItem.id_texto}`;
        console.log('PUT URL:', url);
        
        const response = await adminFetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chave: key, texto: value })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Update result:', result);
      } else {
        // Create new
        console.log('Creating new content');
        const url = `${API_URL}/conteudos`;
        console.log('POST URL:', url);
        
        const response = await adminFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chave: key, texto: value })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Create result:', result);
      }
      
      showMessage('Conteúdo salvo com sucesso!', 'success');
      setEditingContent(null);
      setEditValue('');
      await refreshContent();
      notifyContentChanged();
      return true;
    } catch (error) {
      console.error('Save Error:', error.message);
      showMessage(`Erro ao salvar: ${error.message}`, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const translateAllContent = async () => {
    setIsLoading(true);
    try {
      const requests = [
        `${API_URL}/conteudos/translate-all`,
        `${API_URL}/catalog-translations/translate-all`,
        `${API_URL}/dynamic-translations/translate-all`
      ];
      const results = [];

      for (const url of requests) {
        const response = await adminFetch(url, { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Erro ao traduzir o site');
        results.push(result);
      }
      const [contentResult, catalogResult, dynamicResult] = results;
      await refreshContent();
      notifyContentChanged();
      showMessage(`${contentResult.translatedContent} textos, ${catalogResult.products} produtos, ${catalogResult.sectors} setores, ${dynamicResult.news} notícias e ${dynamicResult.certifications} certificações traduzidos automaticamente.`, 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingProduct = (product) => {
    setProductEdit({ ...product });
  };

  const startCreatingProduct = () => {
    setProductEdit({
      id_prod: null,
      id_setor: '',
      nome: '',
      descricao: '',
      imagem: '',
      ativo: true
    });
  };

  const startCreatingSector = () => {
    setSectorEdit({ id_setor: null, nome: '', descricao: '', imagem: '' });
  };

  const saveSector = async () => {
    if (!sectorEdit.nome.trim()) {
      showMessage('O nome do setor é obrigatório', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminFetch(
        sectorEdit.id_setor ? `${API_URL}/setores/${sectorEdit.id_setor}` : `${API_URL}/setores`,
        {
          method: sectorEdit.id_setor ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: sectorEdit.nome, descricao: sectorEdit.descricao, imagem: sectorEdit.imagem })
        }
      );

      if (!response.ok) throw new Error('Erro ao guardar setor');
      setSectorEdit(null);
      showMessage('Setor guardado com sucesso!', 'success');
      await fetchProducts();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSector = async (sector) => {
    if (!window.confirm(`Eliminar o setor "${sector.nome}"?`)) return;

    setIsLoading(true);
    try {
      const response = await adminFetch(`${API_URL}/setores/${sector.id_setor}`, { method: 'DELETE' });
      if (response.status === 409) {
        const productsResponse = await adminFetch(`${API_URL}/setores/${sector.id_setor}/products`);
        const productsInSector = productsResponse.ok ? await productsResponse.json() : [];
        setSectorReassignment({ sector, products: productsInSector, targetSectorId: '' });
        return;
      }
      if (!response.ok) throw new Error('Não foi possível eliminar o setor.');
      showMessage('Setor eliminado!', 'success');
      await fetchProducts();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const reassignAndDeleteSector = async () => {
    if (!sectorReassignment.targetSectorId) {
      showMessage('Selecione o setor de destino.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const { sector, targetSectorId } = sectorReassignment;
      const reassignResponse = await adminFetch(`${API_URL}/setores/${sector.id_setor}/reassign`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetSectorId: Number(targetSectorId) })
      });
      if (!reassignResponse.ok) throw new Error('Não foi possível reatribuir os produtos.');
      const deleteResponse = await adminFetch(`${API_URL}/setores/${sector.id_setor}`, { method: 'DELETE' });
      if (!deleteResponse.ok) throw new Error('Não foi possível eliminar o setor.');
      setSectorReassignment(null);
      await fetchProducts();
      showMessage('Produtos reatribuídos e setor eliminado.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const markMessageAsRead = async (messageItem) => {
    try {
      const response = await adminFetch(`${API_URL}/messages/${messageItem.id_message}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lida: true })
      });
      if (!response.ok) throw new Error('Erro ao atualizar mensagem');
      await fetchMessages();
      await fetchDashboard();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const deleteMessage = async (messageItem) => {
    if (!window.confirm(`Eliminar a mensagem de ${messageItem.nome}?`)) return;
    try {
      const response = await adminFetch(`${API_URL}/messages/${messageItem.id_message}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao eliminar mensagem');
      await fetchMessages();
      await fetchDashboard();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const startCreatingNews = () => {
    setNewsEdit({ id_noticia: null, titulo: '', link: '', data_publicacao: new Date().toISOString().slice(0, 16), imagem: '', ativa: true });
  };

  const saveNews = async () => {
    if (!newsEdit.titulo.trim()) {
      showMessage('O título da notícia é obrigatório.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await adminFetch(
        newsEdit.id_noticia ? `${API_URL}/noticias/${newsEdit.id_noticia}` : `${API_URL}/noticias`,
        {
          method: newsEdit.id_noticia ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newsEdit, data_publicacao: newsEdit.data_publicacao || undefined })
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao guardar notícia');
      setNewsEdit(null);
      await fetchNews();
      showMessage('Notícia guardada com sucesso!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNews = async (newsItem) => {
    if (!window.confirm(`Eliminar a notícia "${newsItem.titulo}"?`)) return;
    try {
      const response = await adminFetch(`${API_URL}/noticias/${newsItem.id_noticia}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao eliminar notícia');
      await fetchNews();
      showMessage('Notícia eliminada!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const toggleNewsPublishState = async (newsItem) => {
    setIsLoading(true);
    try {
      const response = await adminFetch(`${API_URL}/noticias/${newsItem.id_noticia}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa: !newsItem.ativa })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao atualizar publicação');
      await fetchNews();
      showMessage(newsItem.ativa ? 'Notícia desativada.' : 'Notícia publicada.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadNewsImage = async (file) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await adminFetch(`${API_URL}/uploads`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Erro ao carregar imagem');
      const { imageUrl } = await response.json();
      setNewsEdit((item) => ({ ...item, imagem: imageUrl }));
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminFetch(`${API_URL}/auth/logout`, { method: 'POST' });
    } finally {
      window.location.assign('/login');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nome.toLowerCase().includes(productSearch.trim().toLowerCase());
    const matchesStatus = productStatus === 'all' || (productStatus === 'active' ? product.ativo !== false : product.ativo === false);
    return matchesSearch && matchesStatus;
  });

  const filteredMessages = messages.filter((messageItem) => (
    messageFilter === 'all' || (messageFilter === 'unread' ? !messageItem.lida : messageItem.lida)
  )).sort((first, second) => new Date(second.data_envio) - new Date(first.data_envio));

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmation) {
      showMessage('A confirmação não corresponde à nova palavra-passe.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminFetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao alterar palavra-passe.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmation: '' });
      setIsPasswordModalOpen(false);
      showMessage('Palavra-passe alterada com sucesso!', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProduct = async () => {
    if (!productEdit.nome || !productEdit.id_setor) {
      showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const method = productEdit.id_prod ? 'PUT' : 'POST';
      const url = productEdit.id_prod 
        ? `${API_URL}/produtos/${productEdit.id_prod}`
        : `${API_URL}/produtos`;

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_setor: parseInt(productEdit.id_setor),
          nome: productEdit.nome,
          descricao: productEdit.descricao,
          imagem: productEdit.imagem,
          ativo: productEdit.ativo
        })
      });

      if (response.ok) {
        showMessage(productEdit.id_prod ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!', 'success');
        setProductEdit(null);
        fetchProducts();
        fetchDashboard();
      } else {
        throw new Error('Erro ao atualizar');
      }
    } catch (error) {
      showMessage('Erro ao salvar produto', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este produto?')) return;

    setIsLoading(true);
    try {
      const response = await adminFetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Produto eliminado!', 'success');
        fetchProducts();
        fetchDashboard();
      } else {
        throw new Error('Erro ao eliminar');
      }
    } catch (error) {
      showMessage('Erro ao eliminar produto', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await adminFetch(`${API_URL}/uploads`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Erro ao carregar imagem');
      const { imageUrl } = await response.json();
      setProductEdit(prev => ({ ...prev, imagem: imageUrl }));
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectorImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await adminFetch(`${API_URL}/uploads`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Erro ao carregar imagem');
      const { imageUrl } = await response.json();
      setSectorEdit((sector) => ({ ...sector, imagem: imageUrl }));
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadSiteImage = async (file) => {
    if (!file || !editingImageKey) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await adminFetch(`${API_URL}/uploads`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Erro ao carregar imagem');
      const { imageUrl } = await response.json();
      const saved = await saveContent(editingImageKey, imageUrl);
      if (saved) setEditingImageKey(null);
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCertificationImage = async (file) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await adminFetch(`${API_URL}/uploads`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Erro ao carregar imagem');
      const { imageUrl } = await response.json();
      setCertificationEdit((certification) => ({ ...certification, image: imageUrl }));
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const EditorButton = ({ keyCont, currentValue }) => (
    <button
      className="edit-btn"
      onClick={() => startEditingContent(keyCont, currentValue)}
      title="Editar este conteúdo"
    >
      ✏️
    </button>
  );

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="wrap header-inner">
          <a href="/" className="logo"><img src="http://localhost:5000/uploads/logo.png" alt="Unceta" /></a>
          <nav>
            <a href="/">← Voltar ao site</a>
            <a href="#dashboard">Painel</a>
          </nav>
          <div className="language">
            <span className="language-dot"></span>ADMIN
            <button className="edit-mode-toggle" onClick={logout}>Sair</button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <section id="dashboard" className="admin-dashboard">
        <div className="wrap">
          <div className="dashboard-header">
            <div>
              <h1>Painel de administração</h1>
              <p>{editMode ? 'Modo de edição ativo' : 'Modo de visualização ativo'}</p>
            </div>
            <div className="dashboard-actions">
              <button className={`edit-mode-toggle ${editMode ? 'active' : ''}`} onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Terminar edição' : 'Editar site'}
              </button>
              <button className="btn-translate" onClick={translateAllContent} disabled={isLoading}>Traduzir automaticamente</button>
              <button className="dashboard-password-button" onClick={openTranslationReview}>Rever traduções</button>
              <button className="dashboard-password-button" onClick={() => setIsLanguageManagerOpen(true)}>Idiomas e traduções</button>
              <button className="dashboard-password-button" onClick={() => setIsPasswordModalOpen(true)}>Alterar palavra-passe</button>
              <button className="dashboard-password-button" onClick={() => fetchDashboard()}>Atualizar resumo</button>
            </div>
          </div>
          {dashboard && (
            <>
            <div className="dashboard-metrics">
              <div><strong>{dashboard.activeProducts}</strong><span>Produtos ativos</span></div>
              <div><strong>{dashboard.sectorCount}</strong><span>Setores</span></div>
              <div><strong>{dashboard.unreadMessages}</strong><span>Mensagens por ler</span></div>
            </div>
            <div className="dashboard-top-products">
              <div className="dashboard-section-heading"><h2>Produtos mais vistos</h2><select value={viewRange} onChange={(event) => { setViewRange(event.target.value); fetchDashboard(event.target.value); }}><option value="all">Todo o período</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></div>
              {dashboard.productViews.length === 0 ? <p>Ainda não existem visualizações.</p> : dashboard.productViews.map((item) => (
                <div key={item.id_prod}>
                  <span>{item.id_prod_produto?.nome || 'Produto removido'} <small>{item.id_prod_produto?.id_setor_setore?.nome || 'Sem setor'}</small></span>
                  <strong>{item.get ? item.get('views') : item.views} vistas</strong>
                </div>
              ))}
            </div>
            <div className="dashboard-recent-messages">
              <h2>Mensagens recentes</h2>
              {dashboard.recentMessages.length === 0 ? <p>Não existem mensagens.</p> : dashboard.recentMessages.map((item) => <div key={item.id_message}><span>{item.nome} {!item.lida && <small>Nova</small>}</span><time dateTime={item.data_envio}>{new Date(item.data_envio).toLocaleString()}</time></div>)}
            </div>
            </>
          )}
        </div>
      </section>

      {editMode && (
        <section className="admin-management">
          <div className="wrap">
            <div className="admin-management-header">
              <h2>Setores</h2>
              <button className="btn-create-product" onClick={startCreatingSector}>Novo Setor</button>
            </div>
            <div className="sector-list">
              {sectors.map((sector) => (
                <div className="sector-row" key={sector.id_setor}>
                  <div>
                    <strong>{sector.nome}</strong>
                    {sector.descricao && <p>{sector.descricao}</p>}
                  </div>
                  <div className="row-actions">
                    <button className="card-edit-btn" onClick={() => setSectorEdit({ ...sector })}>Editar</button>
                    <button className="btn-delete" onClick={() => deleteSector(sector)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="admin-management news-management">
          <div className="wrap">
            <div className="admin-management-header">
              <h2>Notícias</h2>
              {editMode && <button className="btn-create-product" onClick={startCreatingNews}>Nova notícia</button>}
            </div>
            <div className="news-admin-list">
              {news.length === 0 ? <p>Não existem notícias criadas.</p> : news.map((item) => (
                <article key={item.id_noticia} className="news-admin-row">
                  {item.imagem && <img src={item.imagem} alt="" />}
                  <div><strong>{item.titulo}</strong><span>{item.ativa ? 'Publicada' : 'Rascunho'} · {new Date(item.data_publicacao).toLocaleString()}</span></div>
                  {editMode && <div className="row-actions"><button className="news-publish-button" onClick={() => toggleNewsPublishState(item)} disabled={isLoading}>{item.ativa ? 'Desativar' : 'Publicar'}</button><button className="card-edit-btn" onClick={() => setNewsEdit({ ...item, data_publicacao: item.data_publicacao ? new Date(item.data_publicacao).toISOString().slice(0, 16) : '' })}>Editar</button><button className="btn-delete" onClick={() => deleteNews(item)}>Eliminar</button></div>}
                </article>
              ))}
            </div>
          </div>
      </section>

      {/* HERO */}
      <section className="hero">
        <div className="hero-image">
          {getContent('hero_image', '') ? <img src={getContent('hero_image', '')} alt="" /> : <div className="ph"></div>}
        </div>
        <div className="hero-content">
          {editMode && (
            <button className="hero-image-edit" onClick={() => setEditingImageKey('hero_image')}>
              Editar imagem de destaque
            </button>
          )}
          <div className="small">
            {editMode && <EditorButton keyCont="hero_subtitle" currentValue={getContent('hero_subtitle', 'Industrial solutions & components')} />}
            {getContent('hero_subtitle', 'Industrial solutions & components')}
          </div>
          <div className="title-wrapper">
            {editMode && <EditorButton keyCont="hero_title" currentValue={getContent('hero_title', 'Connect to the\nright solutions\nwith Unceta.')} />}
            <h1>
              {getContent('hero_title', 'Connect to the\nright solutions\nwith Unceta.').split('\n').map((line, i) => (
                i === 1 ? <span key={i}>{line}</span> : <React.Fragment key={i}>{line}</React.Fragment>
              ))}
            </h1>
          </div>
          <p className="hero-text">
            {editMode && <EditorButton keyCont="hero_description" currentValue={getContent('hero_description', 'Connecting industrial partners with reliable components, technical solutions and trusted suppliers across multiple industries.')} />}
            {getContent('hero_description', 'Connecting industrial partners with reliable components, technical solutions and trusted suppliers across multiple industries.')}
          </p>
          <a href="#products" className="hero-button">Explore our solutions →</a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="wrap about-grid">
          <div className="about-text">
            <div className="small">
              {editMode && <EditorButton keyCont="about_label" currentValue={getContent('about_label', 'About Unceta')} />}
              {getContent('about_label', 'About Unceta')}
            </div>
            <div className="title-wrapper">
              {editMode && <EditorButton keyCont="about_title" currentValue={getContent('about_title', 'The connection between industry and the right solution.')} />}
              <h2 className="section-title">
                {getContent('about_title', 'The connection between industry and the right solution.')}
              </h2>
            </div>
            <p>
              {editMode && <EditorButton keyCont="about_text_1" currentValue={getContent('about_text_1', 'Unceta connects industrial partners with the right cutting, measuring and workshop solutions. We work with suppliers that meet demanding quality standards for professional use.')} />}
              {getContent('about_text_1', 'Unceta connects industrial partners with the right cutting, measuring and workshop solutions. We work with suppliers that meet demanding quality standards for professional use.')}
            </p>
            <p>
              {editMode && <EditorButton keyCont="about_text_2" currentValue={getContent('about_text_2', 'From machine-tool accessories to certified components, our catalogue is built around reliability, precision and technical knowledge.')} />}
              {getContent('about_text_2', 'From machine-tool accessories to certified components, our catalogue is built around reliability, precision and technical knowledge.')}
            </p>
          </div>
          <div className="about-photos">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="about-photo">
                {getContent(`about_image_${i}`, '') ? <img src={getContent(`about_image_${i}`, '')} alt="" /> : <div className="ph"></div>}
                {editMode && <button className="hover-edit" onClick={() => setEditingImageKey(`about_image_${i}`)}>Editar imagem</button>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="connection-line"></div>

      {/* INDUSTRIES */}
      <section id="industries">
        <div className="wrap">
          <div className="industries-header">
            <div className="section-label">
              {editMode && <EditorButton keyCont="industries_label" currentValue={getContent('industries_label', 'Where we operate')} />}
              {getContent('industries_label', 'Where we operate')}
            </div>
            <div className="title-wrapper">
              {editMode && <EditorButton keyCont="industries_title" currentValue={getContent('industries_title', 'Industries we serve')} />}
              <h2 className="section-title">
                {getContent('industries_title', 'Industries we serve')}
              </h2>
            </div>
            <p className="section-description">
              {editMode && <EditorButton keyCont="industries_description" currentValue={getContent('industries_description', 'Our solutions support demanding applications across different industrial sectors.')} />}
              {getContent('industries_description', 'Our solutions support demanding applications across different industrial sectors.')}
            </p>
          </div>
          <div className="industries-grid">
            {sectors.map((sector) => (
              <article key={sector.id_setor} className="industry-card">
                <div className="industry-image">
                  {sector.imagem ? <img src={sector.imagem} alt="" /> : <div className="ph"></div>}
                </div>
                <div className="industry-overlay">
                  <h3>{sector.nome}</h3>
                  {editMode && (
                    <div className="card-edit-controls">
                      <button className="card-edit-btn" onClick={() => setSectorEdit({ ...sector })}>Editar</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products">
        <div className="wrap">
          <div className="products-header">
            <div>
              <div className="section-label">
                {editMode && <EditorButton keyCont="products_label" currentValue={getContent('products_label', 'Featured solutions')} />}
                {getContent('products_label', 'Featured solutions')}
              </div>
              <div className="title-wrapper">
                {editMode && <EditorButton keyCont="products_title" currentValue={getContent('products_title', 'Components that keep industry moving.')} />}
                <h2 className="section-title">
                  {getContent('products_title', 'Components that keep industry moving.')}
                </h2>
              </div>
              <p className="section-description">
                {editMode && <EditorButton keyCont="products_description" currentValue={getContent('products_description', 'A selection of components and technical solutions supplied to different industrial applications.')} />}
                {getContent('products_description', 'A selection of components and technical solutions supplied to different industrial applications.')}
              </p>
            </div>
            {editMode && (
              <button className="btn-create-product" onClick={startCreatingProduct}>
                ➕ Novo Produto
              </button>
            )}
          </div>
          {editMode && (
            <div className="admin-list-filters">
              <input type="search" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Pesquisar produtos" />
              <select value={productStatus} onChange={(event) => setProductStatus(event.target.value)}>
                <option value="all">Todos os estados</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          )}
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-products">
                <p>{products.length === 0 ? 'Nenhum produto criado' : 'Nenhum produto encontrado'}</p>
                {editMode && (
                  <button className="btn-create-product-large" onClick={startCreatingProduct}>
                    ➕ Criar Primeiro Produto
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map(product => (
                <article
                  key={product.id_prod}
                  className={`product-card ${editMode ? 'editable' : ''}`}
                  onClick={() => editMode && startEditingProduct(product)}
                >
                  <div className="product-image">
                    {product.imagem ? (
                      <img src={product.imagem} alt={product.nome} />
                    ) : (
                      <div className="ph"></div>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-sector">{sectors.find(s => s.id_setor === product.id_setor)?.nome}</div>
                    <h3>{product.nome}</h3>
                    <p>{product.descricao}</p>
                    <button type="button" className="product-link">Explore solution →</button>
                  </div>
                  {editMode && (
                    <div className="card-edit-overlay">
                      <button className="card-edit-btn">✏️ Editar Produto</button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* QUALITY */}
      <section id="quality">
        <div className="wrap quality-inner">
          <div className="section-label">
            {editMode && <EditorButton keyCont="quality_label" currentValue={getContent('quality_label', 'Quality & reliability')} />}
            {getContent('quality_label', 'Quality & reliability')}
          </div>
          <div className="title-wrapper">
            {editMode && <EditorButton keyCont="quality_title" currentValue={getContent('quality_title', 'Quality you can trust.')} />}
            <h2 className="section-title">
              {getContent('quality_title', 'Quality you can trust.')}
            </h2>
          </div>
          <p className="quality-description">
            {editMode && <EditorButton keyCont="quality_description" currentValue={getContent('quality_description', 'We work with suppliers that meet recognized quality standards and demanding requirements for professional industrial applications.')} />}
            {getContent('quality_description', 'We work with suppliers that meet recognized quality standards and demanding requirements for professional industrial applications.')}
          </p>
          {editMode && <button className="btn-create-certification" onClick={() => setCertificationEdit({ index: null, image: '' })}>Nova certificação</button>}
          <div className="certifications">
            {qualityCertifications.length === 0 ? <div className="certifications-placeholder">Ainda não existem certificações.</div> : qualityCertifications.map((cert, idx) => (
              <div key={`${cert.image}-${idx}`} className="certification certification-editable">
                {cert.image && <img src={cert.image} alt="Certificação de qualidade" />}
                {editMode && <div className="certification-actions"><button onClick={() => setCertificationEdit({ index: idx, ...cert })}>Editar</button><button onClick={() => deleteCertification(idx)}>Eliminar</button></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacts">
        <div className="wrap contact-grid">
          <div className="contact-info">
            <div className="section-label">
              {editMode && <EditorButton keyCont="contact_label" currentValue={getContent('contact_label', 'Contact')} />}
              {getContent('contact_label', 'Contact')}
            </div>
            <div className="title-wrapper">
              {editMode && <EditorButton keyCont="contact_title" currentValue={getContent('contact_title', "Let's connect.")} />}
              <h2>
                {getContent('contact_title', "Let's connect.")}
              </h2>
            </div>
            <p>
              {editMode && <EditorButton keyCont="contact_description" currentValue={getContent('contact_description', 'Looking for the right component or industrial solution? Get in touch with our team.')} />}
              {getContent('contact_description', 'Looking for the right component or industrial solution? Get in touch with our team.')}
            </p>
            <div className="contact-details">
              <div className="contact-item">
                <strong>Address</strong>
                {editMode && <EditorButton keyCont="contact_address" currentValue={getContent('contact_address', 'Estrada Nacional 1, 137\n3850-052 Albergaria-a-Velha, Portugal')} />}
                <p style={{whiteSpace: 'pre-line'}}>
                  {getContent('contact_address', 'Estrada Nacional 1, 137\n3850-052 Albergaria-a-Velha, Portugal')}
                </p>
              </div>
              <div className="contact-item">
                <strong>Phone</strong>
                {editMode && <EditorButton keyCont="contact_phone" currentValue={getContent('contact_phone', '+351 234 529 670')} />}
                <p>
                  {getContent('contact_phone', '+351 234 529 670')}
                </p>
              </div>
              <div className="contact-item">
                <strong>Email</strong>
                {editMode && <EditorButton keyCont="contact_email" currentValue={getContent('contact_email', 'geral@unceta.pt')} />}
                <p>
                  {getContent('contact_email', 'geral@unceta.pt')}
                </p>
              </div>
            </div>
          </div>
          <div className="contact-message">
            <h3>Mensagens de contacto</h3>
            <div className="admin-list-filters">
              <select value={messageFilter} onChange={(event) => setMessageFilter(event.target.value)}>
                <option value="all">Todas as mensagens</option>
                <option value="unread">Por ler</option>
                <option value="read">Lidas</option>
              </select>
            </div>
            {filteredMessages.length === 0 ? (
              <p>{messages.length === 0 ? 'Não existem mensagens de contacto.' : 'Não existem mensagens neste filtro.'}</p>
            ) : (
              <div className="message-list">
                {filteredMessages.map((messageItem) => (
                  <article className={`message-item ${messageItem.lida ? '' : 'unread'}`} key={messageItem.id_message}>
                    <div>
                      <strong>{messageItem.nome}</strong>
                      <a href={`mailto:${messageItem.email}`}>{messageItem.email}</a>
                      <time dateTime={messageItem.data_envio}>{new Date(messageItem.data_envio).toLocaleString()}</time>
                      <p>{messageItem.conteudo}</p>
                    </div>
                    <div className="row-actions">
                      {!messageItem.lida && <button className="card-edit-btn" onClick={() => markMessageAsRead(messageItem)}>Marcar como lida</button>}
                      <button className="btn-delete" onClick={() => deleteMessage(messageItem)}>Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap footer-inner">
          <img className="footer-logo" src="http://localhost:5000/uploads/logo.m.b.png" alt="Unceta" />
          <div className="copyright">© 2026 Unceta. All rights reserved.</div>
        </div>
      </footer>

      {/* Modals */}
      <ContentEditorModal
        isOpen={editingContent !== null}
        isLoading={isLoading}
        value={editValue}
        onCancel={() => setEditingContent(null)}
        onChange={setEditValue}
        onSave={() => saveContent(editingContent, editValue)}
      />
      <ImageEditorModal isOpen={editingImageKey !== null} isLoading={isLoading} onCancel={() => setEditingImageKey(null)} onUpload={uploadSiteImage} />
      <NewsEditorModal
        news={newsEdit}
        isLoading={isLoading}
        onCancel={() => setNewsEdit(null)}
        onChange={(changes) => setNewsEdit((item) => ({ ...item, ...changes }))}
        onSave={saveNews}
        onUpload={uploadNewsImage}
      />
      <CertificationEditorModal
        certification={certificationEdit}
        isLoading={isLoading}
        onCancel={() => setCertificationEdit(null)}
        onChange={(changes) => setCertificationEdit((item) => ({ ...item, ...changes }))}
        onSave={saveCertification}
        onUpload={uploadCertificationImage}
      />
      <TranslationReviewModal
        review={translationReview}
        drafts={translationDrafts}
        isLoading={isLoading}
        onCancel={() => setTranslationReview(null)}
        onChange={(key, value) => setTranslationDrafts((drafts) => ({ ...drafts, [key]: value }))}
        onSave={saveReviewedTranslation}
      />
      {isLanguageManagerOpen && <LanguageManagerModal
        languages={languages}
        contents={contents}
        translationRecords={translationRecords}
        selectedLanguageId={selectedLanguageId}
        newLanguage={newLanguage}
        isLoading={isLoading}
        onCancel={() => setIsLanguageManagerOpen(false)}
        onSelectLanguage={setSelectedLanguageId}
        onNewLanguageChange={setNewLanguage}
        onCreateLanguage={createLanguage}
        onSaveTranslation={saveContentTranslation}
        onDeleteLanguage={deleteLanguage}
      />}
      {sectorReassignment && (
        <div className="modal-overlay active" onClick={() => setSectorReassignment(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>Reatribuir produtos</h3>
            <p>Antes de eliminar <strong>{sectorReassignment.sector.nome}</strong>, escolha o setor para os seus produtos.</p>
            <ul className="reassignment-products">{sectorReassignment.products.map((product) => <li key={product.id_prod}>{product.nome}</li>)}</ul>
            <div className="form-group"><label htmlFor="replacement-sector">Setor de destino</label><select id="replacement-sector" value={sectorReassignment.targetSectorId} onChange={(event) => setSectorReassignment((state) => ({ ...state, targetSectorId: event.target.value }))}><option value="">Selecione um setor</option>{sectors.filter((sector) => sector.id_setor !== sectorReassignment.sector.id_setor).map((sector) => <option key={sector.id_setor} value={sector.id_setor}>{sector.nome}</option>)}</select></div>
            <div className="modal-actions"><button className="btn-save" onClick={reassignAndDeleteSector} disabled={isLoading}>Reatribuir e eliminar</button><button className="btn-cancel" onClick={() => setSectorReassignment(null)}>Cancelar</button></div>
          </div>
        </div>
      )}
      <ProductEditorModal
        isLoading={isLoading}
        product={productEdit}
        sectors={sectors}
        onCancel={() => setProductEdit(null)}
        onChange={(changes) => setProductEdit((product) => ({ ...product, ...changes }))}
        onDelete={deleteProduct}
        onSave={saveProduct}
        onUpload={handleImageChange}
      />
      {sectorEdit && (
        <div className="modal-overlay active" onClick={() => setSectorEdit(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>{sectorEdit.id_setor ? 'Editar Setor' : 'Novo Setor'}</h3>
            <div className="form-group">
              <label>Nome</label>
              <input value={sectorEdit.nome} onChange={(event) => setSectorEdit((current) => ({ ...current, nome: event.target.value }))} />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea rows="4" value={sectorEdit.descricao || ''} onChange={(event) => setSectorEdit((current) => ({ ...current, descricao: event.target.value }))} />
            </div>
            <div className="form-group">
              <label>Imagem</label>
              <input type="file" accept="image/*" onChange={handleSectorImageChange} />
              {sectorEdit.imagem && <img src={sectorEdit.imagem} alt="Pré-visualização do setor" className="image-preview" />}
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={saveSector} disabled={isLoading}>Guardar</button>
              <button className="btn-cancel" onClick={() => setSectorEdit(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {isPasswordModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsPasswordModalOpen(false)}>
          <form className="modal-content" onSubmit={changePassword} onClick={(event) => event.stopPropagation()}>
            <h3>Alterar palavra-passe</h3>
            <div className="form-group">
              <label htmlFor="current-password">Palavra-passe atual</label>
              <input id="current-password" type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((form) => ({ ...form, currentPassword: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">Nova palavra-passe</label>
              <input id="new-password" type="password" autoComplete="new-password" minLength="8" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))} required />
            </div>
            <div className="form-group">
              <label htmlFor="password-confirmation">Confirmar nova palavra-passe</label>
              <input id="password-confirmation" type="password" autoComplete="new-password" minLength="8" value={passwordForm.confirmation} onChange={(event) => setPasswordForm((form) => ({ ...form, confirmation: event.target.value }))} required />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn-save" disabled={isLoading}>Guardar palavra-passe</button>
              <button type="button" className="btn-cancel" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default AdminPage;
