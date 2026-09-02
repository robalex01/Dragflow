'use strict';

const { DataTypes, Model } = require('sequelize');

class InviteReward extends Model {}

function initInviteReward(sequelize) {
  InviteReward.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      invitesRequired: { type: DataTypes.INTEGER, allowNull: false },
      roleId: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: 'InviteReward',
      tableName: 'invite_rewards',
      timestamps: true,
    }
  );
  return InviteReward;
}

module.exports = { InviteReward, initInviteReward };
