'use strict';

const { DataTypes, Model } = require('sequelize');

class TicketConfig extends Model {}

function initTicketConfig(sequelize) {
  TicketConfig.init(
    {
      guildId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      categoryId: { type: DataTypes.STRING, allowNull: true },
      supportRoleIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      panelChannelId: { type: DataTypes.STRING, allowNull: true },
      panelMessageId: { type: DataTypes.STRING, allowNull: true },
      logChannelId: { type: DataTypes.STRING, allowNull: true },
      nextTicketNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    {
      sequelize,
      modelName: 'TicketConfig',
      tableName: 'ticket_configs',
      timestamps: true,
    }
  );
  return TicketConfig;
}

module.exports = { TicketConfig, initTicketConfig };
