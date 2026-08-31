'use strict';

const { DataTypes, Model } = require('sequelize');

class VoiceTempChannel extends Model {}

function initVoiceTempChannel(sequelize) {
  VoiceTempChannel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false, unique: true },
      ownerId: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: 'VoiceTempChannel',
      tableName: 'voice_temp_channels',
      timestamps: true,
    }
  );
  return VoiceTempChannel;
}

module.exports = { VoiceTempChannel, initVoiceTempChannel };
