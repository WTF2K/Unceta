const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conteudos', {
    id_texto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    chave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "conteudos_chave_key"
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'conteudos',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "conteudos_chave_key",
        unique: true,
        fields: [
          { name: "chave" },
        ]
      },
      {
        name: "conteudos_pkey",
        unique: true,
        fields: [
          { name: "id_texto" },
        ]
      },
    ]
  });
};
