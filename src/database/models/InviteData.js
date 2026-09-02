'use strict';

const { DataTypes, Model } = require('sequelize');

class InviteData extends Model {}

function initInviteData(sequelize) {
  InviteData.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      userId: { type: DataTypes.STRING, allowNull: false },
      invites: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      leaves: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      bonus: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'InviteData',
      tableName: 'invite_data',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'userId'] }],
    }
  );
  return InviteData;
}

module.exports = { InviteData, initInviteData };
