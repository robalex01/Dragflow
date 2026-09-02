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
      suggestionChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supportInvite: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      publicInviteCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      helpMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      inviteAllowedChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkAllowedChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      digicode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      digicodeRoleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      voiceManagerChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      levelingEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      cmdOnlyChannelId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      autoBackupEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
          firewall: false,
          imgmod: false,
          ghostping: false,
          pfpRequired: false,
          securityLevel: 'low',
          antileak: { token: true, ipv4: false, email: false, phone: false },
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
