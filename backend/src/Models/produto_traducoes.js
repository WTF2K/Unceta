const Sequelize = require('sequelize');

module.exports = function produtoTraducoesModel(sequelize, DataTypes) {
  return sequelize.define('produto_traducoes', {
    id_lingua: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'linguas', key: 'id_lingua' }
    },
    id_prod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'produtos', key: 'id_prod' }
    },
    nome: { type: DataTypes.STRING(255), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    tableName: 'produto_traducoes',
    schema: 'public',
    timestamps: false
  });
};