const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('produtos', {
    id_prod: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_setor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'setores',
        key: 'id_setor'
      }
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imagem: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'produtos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_produtos_id_setor",
        fields: [
          { name: "id_setor" },
        ]
      },
      {
        name: "produtos_pkey",
        unique: true,
        fields: [
          { name: "id_prod" },
        ]
      },
    ]
  });
};
