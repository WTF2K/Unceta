const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vistas_produto', {
    id_vista: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_prod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'produtos',
        key: 'id_prod'
      }
    },
    data_vista: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'vistas_produto',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_vistas_data",
        fields: [
          { name: "data_vista" },
        ]
      },
      {
        name: "idx_vistas_id_prod",
        fields: [
          { name: "id_prod" },
        ]
      },
      {
        name: "vistas_produto_pkey",
        unique: true,
        fields: [
          { name: "id_vista" },
        ]
      },
    ]
  });
};
