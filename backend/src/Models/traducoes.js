const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('traducoes', {
    id_lingua: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'linguas',
        key: 'id_lingua'
      }
    },
    id_texto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'conteudos',
        key: 'id_texto'
      }
    },
    texto_trad: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'traducoes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_traducoes_id_texto",
        fields: [
          { name: "id_texto" },
        ]
      },
      {
        name: "traducoes_pkey",
        unique: true,
        fields: [
          { name: "id_lingua" },
          { name: "id_texto" },
        ]
      },
    ]
  });
};
