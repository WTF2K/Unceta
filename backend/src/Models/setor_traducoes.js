const Sequelize = require('sequelize');

module.exports = function setorTraducoesModel(sequelize, DataTypes) {
  return sequelize.define('setor_traducoes', {
    id_lingua: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'linguas', key: 'id_lingua' }
    },
    id_setor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'setores', key: 'id_setor' }
    },
    nome: { type: DataTypes.STRING(255), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    tableName: 'setor_traducoes',
    schema: 'public',
    timestamps: false
  });
};