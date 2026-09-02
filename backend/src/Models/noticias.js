const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('noticias', {
    id_noticia: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    imagem: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data_publicacao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'noticias',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "idx_noticias_data",
        fields: [
          { name: "data_publicacao" },
        ]
      },
      {
        name: "noticias_pkey",
        unique: true,
        fields: [
          { name: "id_noticia" },
        ]
      },
    ]
  });
};
