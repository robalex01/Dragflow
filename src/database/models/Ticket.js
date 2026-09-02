'use strict';

const { DataTypes, Model } = require('sequelize');

class Ticket extends Model {}

function initTicket(sequelize) {
  Ticket.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false, unique: true },
      ownerId: { type: DataTypes.STRING, allowNull: false },
      claimedBy: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.ENUM('open', 'closed'), allowNull: false, defaultValue: 'open' },
      number: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Ticket',
      tableName: 'tickets',
      timestamps: true,
    }
  );
  return Ticket;
}

module.exports = { Ticket, initTicket };
