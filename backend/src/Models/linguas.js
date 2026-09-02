const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('linguas', {
    id_lingua: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: "linguas_code_key"
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'linguas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "linguas_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "linguas_pkey",
        unique: true,
        fields: [
          { name: "id_lingua" },
        ]
      },
    ]
  });
};
