'use strict';

const { DataTypes, Model } = require('sequelize');

class BadWord extends Model {}

function initBadWord(sequelize) {
  BadWord.init(
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
      word: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'BadWord',
      tableName: 'bad_words',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'word'] }],
    }
  );

  return BadWord;
}

module.exports = { BadWord, initBadWord };
