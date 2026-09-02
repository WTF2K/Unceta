import React, { useState, useEffect } from 'react';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Admin() {
  const [activeTab, setActiveTab] = useState('content');
  const [contents, setContents] = useState([]);
  const [products, setProducts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Content Form State
  const [contentForm, setContentForm] = useState({
    id_texto: '',
    chave: '',
    texto: ''
  });
  const [editingContent, setEditingContent] = useState(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    id_prod: '',
    id_setor: '',
    nome: '',
    descricao: '',
    imagem: '',
    ativo: true
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [contentsRes, productsRes, sectorsRes] = await Promise.all([
        fetch(`${API_URL}/conteudos`),
        fetch(`${API_URL}/produtos`),
        fetch(`${API_URL}/setores`)
      ]);

      if (contentsRes.ok) setContents(await contentsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (sectorsRes.ok) setSectors(await sectorsRes.json());
    } catch (error) {
      showMessage('Erro ao carregar dados', 'error');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // ============ CONTENT HANDLERS ============
  const handleContentFormChange = (e) => {
    const { name, value } = e.target;
    setContentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    if (!contentForm.chave || !contentForm.texto) {
      showMessage('Preencha todos os campos', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const method = editingContent ? 'PUT' : 'POST';
      const url = editingContent 
        ? `${API_URL}/conteudos/${editingContent.id_texto}`
        : `${API_URL}/conteudos`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chave: contentForm.chave,
          texto: contentForm.texto
        })
      });

      if (response.ok) {
        showMessage(editingContent ? 'Conteúdo atualizado!' : 'Conteúdo criado!', 'success');
        setContentForm({ id_texto: '', chave: '', texto: '' });
        setEditingContent(null);
        fetchAllData();
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      showMessage('Erro ao salvar conteúdo', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setContentForm({
      id_texto: content.id_texto,
      chave: content.chave,
      texto: content.texto
    });
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este conteúdo?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/conteudos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Conteúdo eliminado!', 'success');
        fetchAllData();
      } else {
        throw new Error('Erro ao eliminar');
      }
    } catch (error) {
      showMessage('Erro ao eliminar conteúdo', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelContentEdit = () => {
    setEditingContent(null);
    setContentForm({ id_texto: '', chave: '', texto: '' });
  };

  // ============ PRODUCT HANDLERS ============
  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, imagem: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.nome || !productForm.id_setor) {
      showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `${API_URL}/produtos/${editingProduct.id_prod}`
        : `${API_URL}/produtos`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_setor: parseInt(productForm.id_setor),
          nome: productForm.nome,
          descricao: productForm.descricao,
          imagem: productForm.imagem,
          ativo: productForm.ativo
        })
      });

      if (response.ok) {
        showMessage(editingProduct ? 'Produto atualizado!' : 'Produto criado!', 'success');
        setProductForm({
          id_prod: '',
          id_setor: '',
          nome: '',
          descricao: '',
          imagem: '',
          ativo: true
        });
        setEditingProduct(null);
        setImagePreview(null);
        fetchAllData();
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      showMessage('Erro ao salvar produto', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      id_prod: product.id_prod,
      id_setor: product.id_setor,
      nome: product.nome,
      descricao: product.descricao || '',
      imagem: product.imagem || '',
      ativo: product.ativo
    });
    setImagePreview(product.imagem);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este produto?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('Produto eliminado!', 'success');
        fetchAllData();
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

  const handleCancelProductEdit = () => {
    setEditingProduct(null);
    setProductForm({
      id_prod: '',
      id_setor: '',
      nome: '',
      descricao: '',
      imagem: '',
      ativo: true
    });
    setImagePreview(null);
  };

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="wrap header-inner">
          <a href="/" className="logo">UNCETA</a>
          <nav>
            <a href="/">← Voltar ao site</a>
          </nav>
          <div className="language">
            <span className="language-dot"></span>ADMIN
          </div>
        </div>
      </header>

      {/* ADMIN CONTAINER */}
      <section className="admin-container">
        <div className="wrap">
          <h1>Painel de Administração</h1>

          {/* Message Alert */}
          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              📝 Gerenciar Conteúdo
            </button>
            <button
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Gerenciar Produtos
            </button>
          </div>

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="tab-content">
              <div className="content-grid">
                {/* Form */}
                <div className="form-section">
                  <h2>{editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h2>
                  <form onSubmit={handleContentSubmit}>
                    <div className="form-group">
                      <label>Chave (identificador)</label>
                      <input
                        type="text"
                        name="chave"
                        value={contentForm.chave}
                        onChange={handleContentFormChange}
                        placeholder="Ex: hero_title"
                        disabled={editingContent}
                      />
                    </div>

                    <div className="form-group">
                      <label>Texto</label>
                      <textarea
                        name="texto"
                        value={contentForm.texto}
                        onChange={handleContentFormChange}
                        placeholder="Digite o conteúdo aqui..."
                        rows="6"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Salvando...' : editingContent ? 'Atualizar' : 'Criar'}
                      </button>
                      {editingContent && (
                        <button
                          type="button"
                          onClick={handleCancelContentEdit}
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List */}
                <div className="list-section">
                  <h2>Conteúdos Existentes</h2>
                  <div className="content-list">
                    {contents.length === 0 ? (
                      <p className="empty-message">Nenhum conteúdo criado</p>
                    ) : (
                      contents.map(content => (
                        <div key={content.id_texto} className="content-item">
                          <div className="content-info">
                            <h4>{content.chave}</h4>
                            <p>{content.texto.substring(0, 100)}...</p>
                          </div>
                          <div className="content-actions">
                            <button
                              onClick={() => handleEditContent(content)}
                              className="btn-small btn-edit"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDeleteContent(content.id_texto)}
                              className="btn-small btn-delete"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="content-grid">
                {/* Form */}
                <div className="form-section">
                  <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                  <form onSubmit={handleProductSubmit}>
                    <div className="form-group">
                      <label>Nome *</label>
                      <input
                        type="text"
                        name="nome"
                        value={productForm.nome}
                        onChange={handleProductFormChange}
                        placeholder="Nome do produto"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Setor *</label>
                      <select
                        name="id_setor"
                        value={productForm.id_setor}
                        onChange={handleProductFormChange}
                        required
                      >
                        <option value="">Selecione um setor</option>
                        {sectors.map(sector => (
                          <option key={sector.id_setor} value={sector.id_setor}>
                            {sector.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea
                        name="descricao"
                        value={productForm.descricao}
                        onChange={handleProductFormChange}
                        placeholder="Descrição do produto"
                        rows="4"
                      />
                    </div>

                    <div className="form-group">
                      <label>Imagem</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imagePreview && (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>

                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="ativo"
                          checked={productForm.ativo}
                          onChange={handleProductFormChange}
                        />
                        Ativo
                      </label>
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={isLoading} className="btn-primary">
                        {isLoading ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Criar'}
                      </button>
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={handleCancelProductEdit}
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Products List */}
                <div className="list-section">
                  <h2>Produtos Existentes</h2>
                  <div className="products-grid">
                    {products.length === 0 ? (
                      <p className="empty-message">Nenhum produto criado</p>
                    ) : (
                      products.map(product => (
                        <div key={product.id_prod} className="product-card">
                          {product.imagem && (
                            <div className="product-image">
                              <img src={product.imagem} alt={product.nome} />
                            </div>
                          )}
                          <div className="product-info">
                            <h4>{product.nome}</h4>
                            <p>{product.descricao}</p>
                            <p className="product-meta">
                              {sectors.find(s => s.id_setor === product.id_setor)?.nome}
                            </p>
                            <span className={`badge ${product.ativo ? 'active' : 'inactive'}`}>
                              {product.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="product-actions">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="btn-small btn-edit"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id_prod)}
                              className="btn-small btn-delete"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Admin;
