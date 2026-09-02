const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admins', {
    id_admin: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "admins_email_key"
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'admins',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "admins_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "admins_pkey",
        unique: true,
        fields: [
          { name: "id_admin" },
        ]
      },
    ]
  });
};
