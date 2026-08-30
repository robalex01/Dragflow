'use strict';

const { DataTypes, Model } = require('sequelize');

class DisabledCommand extends Model {}

function initDisabledCommand(sequelize) {
  DisabledCommand.init(
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
    },
    {
      sequelize,
      modelName: 'DisabledCommand',
      tableName: 'disabled_commands',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'commandName'] }],
    }
  );

  return DisabledCommand;
}

module.exports = { DisabledCommand, initDisabledCommand };
