var DataTypes = require("sequelize").DataTypes;
var _admins = require("./admins");
var _conteudos = require("./conteudos");
var _certificacao_traducoes = require("./certificacao_traducoes");
var _linguas = require("./linguas");
var _messages = require("./messages");
var _noticias = require("./noticias");
var _noticia_traducoes = require("./noticia_traducoes");
var _produtos = require("./produtos");
var _produto_traducoes = require("./produto_traducoes");
var _setores = require("./setores");
var _setor_traducoes = require("./setor_traducoes");
var _traducoes = require("./traducoes");
var _vistas_produto = require("./vistas_produto");

function initModels(sequelize) {
  var admins = _admins(sequelize, DataTypes);
  var conteudos = _conteudos(sequelize, DataTypes);
  var certificacao_traducoes = _certificacao_traducoes(sequelize, DataTypes);
  var linguas = _linguas(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var noticias = _noticias(sequelize, DataTypes);
  var noticia_traducoes = _noticia_traducoes(sequelize, DataTypes);
  var produtos = _produtos(sequelize, DataTypes);
  var produto_traducoes = _produto_traducoes(sequelize, DataTypes);
  var setores = _setores(sequelize, DataTypes);
  var setor_traducoes = _setor_traducoes(sequelize, DataTypes);
  var traducoes = _traducoes(sequelize, DataTypes);
  var vistas_produto = _vistas_produto(sequelize, DataTypes);

  conteudos.belongsToMany(linguas, { as: 'id_lingua_linguas', through: traducoes, foreignKey: "id_texto", otherKey: "id_lingua" });
  linguas.belongsToMany(conteudos, { as: 'id_texto_conteudos', through: traducoes, foreignKey: "id_lingua", otherKey: "id_texto" });
  traducoes.belongsTo(conteudos, { as: "id_texto_conteudo", foreignKey: "id_texto"});
  conteudos.hasMany(traducoes, { as: "traducos", foreignKey: "id_texto"});
  traducoes.belongsTo(linguas, { as: "id_lingua_lingua", foreignKey: "id_lingua"});
  linguas.hasMany(traducoes, { as: "traducos", foreignKey: "id_lingua"});
  vistas_produto.belongsTo(produtos, { as: "id_prod_produto", foreignKey: "id_prod"});
  produtos.hasMany(vistas_produto, { as: "vistas_produtos", foreignKey: "id_prod"});
  produtos.belongsTo(setores, { as: "id_setor_setore", foreignKey: "id_setor"});
  setores.hasMany(produtos, { as: "produtos", foreignKey: "id_setor"});
  produto_traducoes.belongsTo(produtos, { as: 'produto', foreignKey: 'id_prod' });
  produtos.hasMany(produto_traducoes, { as: 'traducoes', foreignKey: 'id_prod' });
  produto_traducoes.belongsTo(linguas, { as: 'lingua', foreignKey: 'id_lingua' });
  setor_traducoes.belongsTo(setores, { as: 'setor', foreignKey: 'id_setor' });
  setores.hasMany(setor_traducoes, { as: 'traducoes', foreignKey: 'id_setor' });
  setor_traducoes.belongsTo(linguas, { as: 'lingua', foreignKey: 'id_lingua' });
  noticia_traducoes.belongsTo(noticias, { as: 'noticia', foreignKey: 'id_noticia' });
  noticias.hasMany(noticia_traducoes, { as: 'traducoes', foreignKey: 'id_noticia' });
  noticia_traducoes.belongsTo(linguas, { as: 'lingua', foreignKey: 'id_lingua' });
  certificacao_traducoes.belongsTo(linguas, { as: 'lingua', foreignKey: 'id_lingua' });

  return {
    admins,
    conteudos,
    certificacao_traducoes,
    linguas,
    messages,
    noticias,
    noticia_traducoes,
    produtos,
    produto_traducoes,
    setores,
    setor_traducoes,
    traducoes,
    vistas_produto,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
