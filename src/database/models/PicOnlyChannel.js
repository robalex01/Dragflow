'use strict';

const { DataTypes, Model } = require('sequelize');

class PicOnlyChannel extends Model {}

function initPicOnlyChannel(sequelize) {
  PicOnlyChannel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    {
      sequelize,
      modelName: 'PicOnlyChannel',
      tableName: 'pic_only_channels',
      timestamps: true,
    }
  );
  return PicOnlyChannel;
}

module.exports = { PicOnlyChannel, initPicOnlyChannel };
