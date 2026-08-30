'use strict';

const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const { config } = require('../config/config');
const Logger = require('../utils/Logger');

/**
 * Instancie la connexion Sequelize en fonction de la configuration.
 * - dialect "postgres" (recommandé en production) : utilise DATABASE_URL
 *   ou les champs détaillés (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).
 * - dialect "sqlite" (pratique en développement local sans serveur Postgres).
 */
function createSequelizeInstance() {
  const commonOptions = {
    logging: config.env === 'development' ? false : false,
    define: {
      freezeTableName: true,
      timestamps: true,
    },
  };

  if (config.database.dialect === 'sqlite') {
    const storagePath = path.resolve(process.cwd(), config.database.sqliteStorage);
    const dir = path.dirname(storagePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      ...commonOptions,
    });
  }

  // PostgreSQL
  if (config.database.url) {
    return new Sequelize(config.database.url, {
      dialect: 'postgres',
      dialectOptions:
        config.env === 'production'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      ...commonOptions,
    });
  }

  return new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    ...commonOptions,
  });
}

const sequelize = createSequelizeInstance();

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    Logger.success(`Connexion à la base de données établie (dialect: ${config.database.dialect}).`);
  } catch (error) {
    Logger.error('Impossible de se connecter à la base de données.', error);
    throw error;
  }
}

async function syncDatabase({ alter = false } = {}) {
  await sequelize.sync({ alter });
  Logger.success('Modèles synchronisés avec la base de données.');
}

module.exports = { sequelize, connectDatabase, syncDatabase };
