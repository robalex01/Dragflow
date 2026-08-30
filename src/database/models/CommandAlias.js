'use strict';

const { DataTypes, Model } = require('sequelize');

class CommandAlias extends Model {}

function initCommandAlias(sequelize) {
  CommandAlias.init(
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
      alias: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      commandName: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CommandAlias',
      tableName: 'command_aliases',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'alias'] }],
    }
  );

  return CommandAlias;
}

module.exports = { CommandAlias, initCommandAlias };
