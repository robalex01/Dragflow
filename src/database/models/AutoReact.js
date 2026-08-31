'use strict';

const { DataTypes, Model } = require('sequelize');

class AutoReact extends Model {}

function initAutoReact(sequelize) {
  AutoReact.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false, unique: true },
      // Liste d'emojis (unicode ou <:nom:id>) stockée en JSON
      emojis: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    },
    {
      sequelize,
      modelName: 'AutoReact',
      tableName: 'auto_reacts',
      timestamps: true,
    }
  );
  return AutoReact;
}

module.exports = { AutoReact, initAutoReact };
