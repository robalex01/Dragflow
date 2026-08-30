'use strict';

const { DataTypes, Model } = require('sequelize');

class CustomPermission extends Model {}

function initCustomPermission(sequelize) {
  CustomPermission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      guildId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        // Nom de la permission personnalisée (ex: "moderator", "helper", "vip")
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      // Liste des IDs de rôles/membres/'everyone' possédant cette permission
      holders: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: 'CustomPermission',
      tableName: 'custom_permissions',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'name'] }],
    }
  );

  return CustomPermission;
}

module.exports = { CustomPermission, initCustomPermission };
