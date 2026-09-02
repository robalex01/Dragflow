'use strict';

const { DataTypes, Model } = require('sequelize');

class Backup extends Model {}

function initBackup(sequelize) {
  Backup.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      data: { type: DataTypes.JSON, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Backup',
      tableName: 'backups',
      timestamps: true,
    }
  );
  return Backup;
}

module.exports = { Backup, initBackup };
