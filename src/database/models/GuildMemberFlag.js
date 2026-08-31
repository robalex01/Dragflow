'use strict';

const { DataTypes, Model } = require('sequelize');

/**
 * Stocke les statuts spéciaux d'un membre sur un serveur :
 * blacklist, whitelist, manager.
 * Un même userId peut avoir plusieurs "flag" différents (lignes distinctes).
 */
class GuildMemberFlag extends Model {}

function initGuildMemberFlag(sequelize) {
  GuildMemberFlag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      guildId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flag: {
        type: DataTypes.ENUM('blacklist', 'whitelist', 'manager', 'protected'),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'GuildMemberFlag',
      tableName: 'guild_member_flags',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'userId', 'flag'] }],
    }
  );

  return GuildMemberFlag;
}

module.exports = { GuildMemberFlag, initGuildMemberFlag };
