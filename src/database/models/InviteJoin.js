'use strict';

const { DataTypes, Model } = require('sequelize');

class InviteJoin extends Model {}

function initInviteJoin(sequelize) {
  InviteJoin.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      memberId: { type: DataTypes.STRING, allowNull: false },
      inviterId: { type: DataTypes.STRING, allowNull: true },
      inviteCode: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: 'InviteJoin',
      tableName: 'invite_joins',
      timestamps: true,
    }
  );
  return InviteJoin;
}

module.exports = { InviteJoin, initInviteJoin };
