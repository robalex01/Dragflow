'use strict';

const { DataTypes, Model } = require('sequelize');

/**
 * Table à ligne unique (id=1) stockant les réglages globaux du bot
 * (footer par défaut des embeds, couleur de thème, rotation de statut).
 */
class BotSettings extends Model {}

function initBotSettings(sequelize) {
  BotSettings.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
      footerText: { type: DataTypes.STRING(200), allowNull: true },
      embedColor: { type: DataTypes.STRING(7), allowNull: true },
      statusRotatorEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'BotSettings',
      tableName: 'bot_settings',
      timestamps: true,
    }
  );
  return BotSettings;
}

module.exports = { BotSettings, initBotSettings };
