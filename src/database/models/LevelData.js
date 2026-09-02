'use strict';

const { DataTypes, Model } = require('sequelize');

class LevelData extends Model {}

function initLevelData(sequelize) {
  LevelData.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      userId: { type: DataTypes.STRING, allowNull: false },
      // XP accumulée dans le niveau actuel (progression vers le niveau suivant)
      xp: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      lastMessageAt: { type: DataTypes.DATE, allowNull: true },
      // Couleur personnalisée de la carte de rang (+customrank)
      rankColor: { type: DataTypes.STRING(7), allowNull: true },
    },
    {
      sequelize,
      modelName: 'LevelData',
      tableName: 'level_data',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'userId'] }],
    }
  );
  return LevelData;
}

module.exports = { LevelData, initLevelData };
