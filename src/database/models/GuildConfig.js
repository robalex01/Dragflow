'use strict';

const { DataTypes, Model } = require('sequelize');
const { config } = require('../../config/config');

class GuildConfig extends Model {}

// JSONB n'est disponible que sous PostgreSQL ; on retombe sur JSON ailleurs (ex: SQLite en dev).
const JsonType = config.database.dialect === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;

function initGuildConfig(sequelize) {
  GuildConfig.init(
    {
      guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      prefix: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: config.bot.defaultPrefix,
      },
      embedColor: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: config.embeds.color,
      },
      logsChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Salons de logs spécifiques (JSON: { moderation: id, messages: id, joins: id, ... })
      logChannels: {
        type: JsonType,
        allowNull: false,
        defaultValue: {},
      },
      welcomeChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      welcomeMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      leaveChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      leaveMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      autoRoleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Paramètres de protection (antispam, antilink, antiinvite, antiraid, ...)
      protectionSettings: {
        type: JsonType,
        allowNull: false,
        defaultValue: {
          antispam: false,
          antilink: false,
          antiinvite: false,
          antialt: false,
          raidmode: false,
          securityLevel: 'low',
        },
      },
    },
    {
      sequelize,
      modelName: 'GuildConfig',
      tableName: 'guild_configs',
      timestamps: true,
    }
  );

  return GuildConfig;
}

module.exports = { GuildConfig, initGuildConfig };
