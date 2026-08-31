'use strict';

const { DataTypes, Model } = require('sequelize');

class Counter extends Model {}

function initCounter(sequelize) {
  Counter.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
      type: {
        type: DataTypes.ENUM('members', 'humans', 'bots', 'boosters'),
        allowNull: false,
      },
      // Gabarit du nom, doit contenir {count} (ex: "Membres: {count}")
      template: { type: DataTypes.STRING(100), allowNull: false },
    },
    {
      sequelize,
      modelName: 'Counter',
      tableName: 'counters',
      timestamps: true,
    }
  );
  return Counter;
}

module.exports = { Counter, initCounter };
