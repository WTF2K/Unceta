import React, { useEffect, useState } from 'react';
import { usePageContent } from './hooks/usePageContent';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function App() {
  const { activeLanguage, getContent, languages, setActiveLanguage } = usePageContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formMessage, setFormMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [news, setNews] = useState([]);
  const [catalogTranslations, setCatalogTranslations] = useState({ products: {}, sectors: {} });
  const [dynamicTranslations, setDynamicTranslations] = useState({ news: {}, certifications: {} });
  const [carouselStart, setCarouselStart] = useState(0);
  const [newsCarouselStart, setNewsCarouselStart] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSectorId, setSelectedSectorId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsResponse, sectorsResponse, translationsResponse, newsResponse, dynamicResponse] = await Promise.all([
          fetch(`${API_URL}/produtos`),
          fetch(`${API_URL}/setores`),
          fetch(`${API_URL}/catalog-translations`),
          fetch(`${API_URL}/noticias`),
          fetch(`${API_URL}/dynamic-translations`)
        ]);

        if (productsResponse.ok) setProducts(await productsResponse.json());
        if (sectorsResponse.ok) setSectors(await sectorsResponse.json());
        if (newsResponse.ok) setNews((await newsResponse.json()).filter((item) => item.ativa !== false));
        if (dynamicResponse.ok) {
          const dynamicData = await dynamicResponse.json();
          const translationMap = { news: {}, certifications: {} };
          dynamicData.news.forEach((item) => { translationMap.news[`${item.id_lingua}:${item.id_noticia}`] = item.titulo; });
          dynamicData.certifications.forEach((item) => { translationMap.certifications[`${item.id_lingua}:${item.indice}`] = item.texto; });
          setDynamicTranslations(translationMap);
        }
        if (translationsResponse.ok) {
          const translationData = await translationsResponse.json();
          const translationMap = { products: {}, sectors: {} };
          translationData.products.forEach((translation) => {
            translationMap.products[`${translation.id_lingua}:${translation.id_prod}`] = translation;
          });
          translationData.sectors.forEach((translation) => {
            translationMap.sectors[`${translation.id_lingua}:${translation.id_setor}`] = translation;
          });
          setCatalogTranslations(translationMap);
        }
      } catch (error) {
        console.error('Product loading error:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.name,
          email: formData.email,
          conteudo: formData.message
        })
      });

      if (response.ok) {
        setFormMessage({
          type: 'success',
          text: 'Mensagem enviada com sucesso! Obrigado pelo seu contacto.'
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: 'Erro ao enviar mensagem. Por favor, tente novamente.'
      });
      console.error('Form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeProducts = products.filter((product) => (
    product.ativo !== false && (selectedSectorId === null || product.id_setor === selectedSectorId)
  ));
  const visibleProducts = activeProducts.length > 3
    ? [0, 1, 2].map((offset) => activeProducts[(carouselStart + offset) % activeProducts.length])
    : activeProducts;
  const hasMultipleCarouselPages = activeProducts.length > 3;
  const visibleNews = news.length > 3
    ? [0, 1, 2].map((offset) => news[(newsCarouselStart + offset) % news.length])
    : news;
  const hasMultipleNewsPages = news.length > 3;

  const showPreviousProducts = () => setCarouselStart((current) => (
    (current - 1 + activeProducts.length) % activeProducts.length
  ));
  const showNextProducts = () => setCarouselStart((current) => (
    (current + 1) % activeProducts.length
  ));
  const showPreviousNews = () => setNewsCarouselStart((current) => (
    (current - 1 + news.length) % news.length
  ));
  const showNextNews = () => setNewsCarouselStart((current) => (
    (current + 1) % news.length
  ));

  const selectSector = (sectorId) => {
    setSelectedSectorId(sectorId);
    setCarouselStart(0);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showAllProducts = () => {
    setSelectedSectorId(null);
    setCarouselStart(0);
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    fetch(`${API_URL}/produtos/${product.id_prod}/view`, { method: 'POST' }).catch(() => {});
  };

  const getCatalogTranslation = (type, item) => {
    if (!item) return null;
    const language = languages.find((languageItem) => languageItem.code === activeLanguage);
    const itemId = type === 'products' ? item.id_prod : item.id_setor;
    return language ? catalogTranslations[type][`${language.id_lingua}:${itemId}`] : null;
  };

  const getSectorName = (sector) => getCatalogTranslation('sectors', sector)?.nome || sector?.nome || '';
  const getProductName = (product) => getCatalogTranslation('products', product)?.nome || product.nome;
  const getProductDescription = (product) => getCatalogTranslation('products', product)?.descricao || product.descricao;
  const getLanguageId = () => languages.find((language) => language.code === activeLanguage)?.id_lingua;
  const getNewsTitle = (item) => dynamicTranslations.news[`${getLanguageId()}:${item.id_noticia}`] || item.titulo;
  const getCertificationText = (item, index) => dynamicTranslations.certifications[`${getLanguageId()}:${index}`] || item.text;
  const heroImage = getContent('hero_image', '');
  const qualityCertifications = (() => {
    try {
      const certifications = JSON.parse(getContent('quality_certifications', '[]'));
      return Array.isArray(certifications) ? certifications : [];
    } catch (error) {
      return [];
    }
  })();

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="wrap header-inner">
          <a href="/" className="logo" aria-label="Unceta home"><img src="http://localhost:3000/uploads/logo.png" alt="Unceta" /></a>
          <nav>
            <a href="#about">{getContent('nav_about', 'About Us')}</a>
            <a href="#industries">{getContent('nav_industries', 'Industries')}</a>
            <a href="#products">{getContent('nav_products', 'Solutions')}</a>
            <a href="#news">{getContent('nav_news', 'News')}</a>
            <a href="#quality">{getContent('nav_quality', 'Quality')}</a>
            <a href="#contacts">{getContent('nav_contacts', 'Contacts')}</a>
          </nav>
          <div className="language language-selector" aria-label="Select language">
            {languages.map((language) => (
              <button
                type="button"
                className={activeLanguage === language.code ? 'active-language' : ''}
                key={language.code}
                onClick={() => setActiveLanguage(language.code)}
              >
                {language.code.toUpperCase()}
              </button>
            ))}
            <a href="/admin" className="admin-link">ADMIN</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-image">
          {heroImage ? <img src={heroImage} alt="" /> : <div className="ph"></div>}
        </div>
        <div className="hero-content">
          <div className="small">{getContent('hero_subtitle', 'Industrial solutions & components')}</div>
          <h1>
            {getContent('hero_title', 'Connect to the\nright solutions\nwith Unceta.').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < getContent('hero_title', '').split('\n').length - 1 && <span></span>}
              </React.Fragment>
            ))}
          </h1>
          <p className="hero-text">
            {getContent('hero_description', 'Connecting industrial partners with reliable components, technical solutions and trusted suppliers across multiple industries.')}
          </p>
          <a href="#products" className="hero-button">{getContent('hero_button', 'Explore our solutions')} →</a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="wrap about-grid">
          <div className="about-text">
            <div className="section-label">{getContent('about_label', 'About Unceta')}</div>
            <h2 className="section-title">{getContent('about_title', 'The connection between industry and the right solution.')}</h2>
            <p>
              {getContent('about_text_1', 'Unceta connects industrial partners with the right cutting, measuring and workshop solutions.\nWe work with suppliers that meet demanding quality standards for professional use.')}
            </p>
            <p>
              {getContent('about_text_2', 'From machine-tool accessories to certified components, our catalogue is built around reliability, precision and technical knowledge.')}
            </p>
          </div>
          <div className="about-photos">
            {[1, 2, 3, 4].map((index) => {
              const imageUrl = getContent(`about_image_${index}`, '');
              return <div className="about-photo" key={index}>{imageUrl ? <img src={imageUrl} alt="" /> : <div className="ph"></div>}</div>;
            })}
          </div>
        </div>
      </section>

      <div className="connection-line"></div>

      {/* INDUSTRIES */}
      <section id="industries">
        <div className="wrap">
          <div className="industries-header">
            <div className="section-label">{getContent('industries_label', 'Where we operate')}</div>
            <h2 className="section-title">{getContent('industries_title', 'Industries we serve')}</h2>
            <p className="section-description">
              {getContent('industries_description', 'Our solutions support demanding applications across different industrial sectors.')}
            </p>
          </div>
          <div className="industries-grid">
            {sectors.map((sector) => (
              <button key={sector.id_setor} type="button" className="industry-card" onClick={() => selectSector(sector.id_setor)}>
                <div className="industry-image">
                  {sector.imagem ? <img src={sector.imagem} alt="" /> : <div className="ph"></div>}
                </div>
                <div className="industry-overlay">
                  <h3>{getSectorName(sector)}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products">
        <div className="wrap">
          <div className="products-header">
            <div>
              <div className="section-label">{getContent('products_label', 'Featured solutions')}</div>
              <h2 className="section-title">{getContent('products_title', 'Components that keep industry moving.')}</h2>
              <p className="section-description">
                {getContent('products_description', 'A selection of components and technical solutions supplied to different industrial applications.')}
              </p>
            </div>
            {selectedSectorId !== null && (
              <button type="button" className="product-filter-reset" onClick={showAllProducts}>All solutions</button>
            )}
          </div>
          <div className={`product-carousel ${hasMultipleCarouselPages ? '' : 'product-carousel-static'}`}>
            {hasMultipleCarouselPages && (
              <button
                type="button"
                className="carousel-button carousel-button-previous"
                onClick={showPreviousProducts}
                aria-label="Show previous products"
              >
                &#8592;
              </button>
            )}
            <div className={`products-grid products-grid-${visibleProducts.length}`}>
            {visibleProducts.length === 0 ? (
              <p className="empty-products">No active products are available in this sector.</p>
            ) : visibleProducts.map(product => (
              <button key={product.id_prod} type="button" className="product-card" onClick={() => openProduct(product)}>
                <div className="product-image">
                  {product.imagem ? <img src={product.imagem} alt={getProductName(product)} /> : <div className="ph"></div>}
                </div>
                <div className="product-info">
                  <div className="product-sector">{getSectorName(sectors.find((sector) => sector.id_setor === product.id_setor))}</div>
                  <h3>{getProductName(product)}</h3>
                </div>
              </button>
            ))}
            </div>
            {hasMultipleCarouselPages && (
              <button
                type="button"
                className="carousel-button carousel-button-next"
                onClick={showNextProducts}
                aria-label="Show next products"
              >
                &#8594;
              </button>
            )}
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section id="news" className="news-section">
          <div className="wrap">
            <div className="section-label">News</div>
            <h2 className="section-title">Latest updates</h2>
            <div className={`news-carousel ${hasMultipleNewsPages ? '' : 'news-carousel-static'}`}>
              {hasMultipleNewsPages && <button type="button" className="carousel-button" onClick={showPreviousNews} aria-label="Show previous news">&#8592;</button>}
              <div className={`news-grid news-grid-${visibleNews.length}`}>
              {visibleNews.map((item) => (
                <article className="news-card" key={item.id_noticia}>
                  {item.imagem && <img src={item.imagem} alt={getNewsTitle(item)} />}
                  <div><time dateTime={item.data_publicacao}>{new Date(item.data_publicacao).toLocaleDateString()}</time><h3>{getNewsTitle(item)}</h3>{item.link !== '#' && <a href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined} rel={item.link.startsWith('http') ? 'noreferrer' : undefined}>Read update</a>}</div>
                </article>
              ))}
              </div>
              {hasMultipleNewsPages && <button type="button" className="carousel-button" onClick={showNextNews} aria-label="Show next news">&#8594;</button>}
            </div>
          </div>
        </section>
      )}

      {/* QUALITY */}
      <section id="quality">
        <div className="wrap quality-inner">
          <div className="section-label">{getContent('quality_label', 'Quality & reliability')}</div>
          <h2 className="section-title">{getContent('quality_title', 'Quality you can trust.')}</h2>
          <p className="quality-description">
            {getContent('quality_description', 'We work with suppliers that meet recognized quality standards and demanding requirements for professional industrial applications.')}
          </p>
          <div className="certifications">
            {qualityCertifications.map((cert, idx) => (
              <div key={idx} className="certification">
                <div>{cert.code}<br /><strong>{cert.num}</strong><small>{getCertificationText(cert, idx)}</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contacts">
        <div className="wrap contact-grid">
          <div className="contact-info">
            <div className="section-label">{getContent('contact_label', 'Contact')}</div>
            <h2>{getContent('contact_title', "Let's connect.")}</h2>
            <p>{getContent('contact_description', 'Looking for the right component or industrial solution? Get in touch with our team.')}</p>
            <div className="contact-details">
              <div className="contact-item">
                <strong>Address</strong>
                {getContent('contact_address', 'Estrada Nacional 1, 137\n3850-052 Albergaria-a-Velha, Portugal').split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < getContent('contact_address', '').split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <div className="contact-item">
                <strong>Phone</strong>
                {getContent('contact_phone', '+351 234 529 670')}
              </div>
              <div className="contact-item">
                <strong>Email</strong>
                {getContent('contact_email', 'geral@unceta.pt')}
              </div>
            </div>
          </div>
          <form onSubmit={handleFormSubmit}>
            {formMessage && (
              <div className={`form-message ${formMessage.type}`}>
                {formMessage.text}
              </div>
            )}
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder={getContent('form_name_placeholder', 'Your name')}
                value={formData.name}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                placeholder={getContent('form_email_placeholder', 'Your email')}
                value={formData.email}
                onChange={handleFormChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <textarea
              name="message"
              placeholder={getContent('form_message_placeholder', 'How can we help you?')}
              value={formData.message}
              onChange={handleFormChange}
              required
              disabled={isSubmitting}
            ></textarea>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : `${getContent('form_send_button', 'Send message')} →`}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap footer-inner">
          <img className="footer-logo" src="http://localhost:3000/uploads/logo.png" alt="Unceta" />
          <div className="copyright">© 2026 Unceta. All rights reserved.</div>
        </div>
      </footer>

      {selectedProduct && (
        <div className="product-modal-backdrop" role="presentation" onClick={() => setSelectedProduct(null)}>
          <article className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="product-modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product details">&#215;</button>
            <div className="product-modal-image">
              {selectedProduct.imagem ? <img src={selectedProduct.imagem} alt={getProductName(selectedProduct)} /> : <div className="ph"></div>}
            </div>
            <div className="product-modal-info">
              <div className="product-sector">{getSectorName(sectors.find((sector) => sector.id_setor === selectedProduct.id_setor))}</div>
              <h2 id="product-modal-title">{getProductName(selectedProduct)}</h2>
              <p>{getProductDescription(selectedProduct) || 'No description is available for this product.'}</p>
            </div>
          </article>
        </div>
      )}
    </>
  );
}

export default App;
