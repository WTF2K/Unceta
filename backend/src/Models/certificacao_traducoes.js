module.exports = function certificacaoTraducoesModel(sequelize, DataTypes) {
  return sequelize.define('certificacao_traducoes', {
    id_lingua: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: 'linguas', key: 'id_lingua' } },
    indice: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    texto: { type: DataTypes.STRING(255), allowNull: false }
  }, { sequelize, tableName: 'certificacao_traducoes', schema: 'public', timestamps: false });
};