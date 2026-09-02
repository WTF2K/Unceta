module.exports = function noticiaTraducoesModel(sequelize, DataTypes) {
  return sequelize.define('noticia_traducoes', {
    id_lingua: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: 'linguas', key: 'id_lingua' } },
    id_noticia: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: 'noticias', key: 'id_noticia' } },
    titulo: { type: DataTypes.STRING(255), allowNull: false }
  }, { sequelize, tableName: 'noticia_traducoes', schema: 'public', timestamps: false });
};