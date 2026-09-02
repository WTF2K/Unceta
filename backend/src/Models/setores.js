const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('setores', {
    id_setor: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "setores_nome_key"
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imagem: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'setores',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "setores_nome_key",
        unique: true,
        fields: [
          { name: "nome" },
        ]
      },
      {
        name: "setores_pkey",
        unique: true,
        fields: [
          { name: "id_setor" },
        ]
      },
    ]
  });
};
