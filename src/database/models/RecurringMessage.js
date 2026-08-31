'use strict';

const { DataTypes, Model } = require('sequelize');

class RecurringMessage extends Model {}

function initRecurringMessage(sequelize) {
  RecurringMessage.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      intervalMs: { type: DataTypes.BIGINT, allowNull: false },
      lastSentAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'RecurringMessage',
      tableName: 'recurring_messages',
      timestamps: true,
    }
  );
  return RecurringMessage;
}

module.exports = { RecurringMessage, initRecurringMessage };
