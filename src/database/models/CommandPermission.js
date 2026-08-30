'use strict';

const { DataTypes, Model } = require('sequelize');

class CommandPermission extends Model {}

function initCommandPermission(sequelize) {
  CommandPermission.init(
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
      commandName: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      // Nom de la permission requise (correspond à CustomPermission.name,
      // ou l'une des permissions de base : everyone, membre, helper, moderator,
      // administrator, manager, owner, buyer)
      permissionName: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CommandPermission',
      tableName: 'command_permissions',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'commandName'] }],
    }
  );

  return CommandPermission;
}

module.exports = { CommandPermission, initCommandPermission };
