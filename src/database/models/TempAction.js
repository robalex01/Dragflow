'use strict';

const { DataTypes, Model } = require('sequelize');

class TempAction extends Model {}

function initTempAction(sequelize) {
  TempAction.init(
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
      type: {
        type: DataTypes.ENUM('tempban', 'temprole'),
        allowNull: false,
      },
      // Uniquement pour 'temprole'
      roleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      executed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'TempAction',
      tableName: 'temp_actions',
      timestamps: true,
    }
  );

  return TempAction;
}

module.exports = { TempAction, initTempAction };
