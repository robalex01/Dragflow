'use strict';

const { DataTypes, Model } = require('sequelize');

class CustomCommand extends Model {}

function initCustomCommand(sequelize) {
  CustomCommand.init(
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
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      // Contenu texte brut (supporte les variables {user}, {server}, ...)
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Embed optionnel sérialisé en JSON (titre, description, couleur, ...)
      embedData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CustomCommand',
      tableName: 'custom_commands',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'name'] }],
    }
  );

  return CustomCommand;
}

module.exports = { CustomCommand, initCustomCommand };
