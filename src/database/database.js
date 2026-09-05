'use strict';

const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const { config } = require('../config/config');
const Logger = require('../utils/Logger');

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

/**
 * Vrai si l'URL de connexion pointe vers un hôte local (pas besoin de SSL).
 * Toute URL malformée est traitée par prudence comme "non locale" (SSL activé).
 */
function isLocalHost(connectionUrl) {
  try {
    return LOCAL_HOSTNAMES.has(new URL(connectionUrl).hostname);
  } catch {
    return false;
  }
}

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
    // Active le SSL automatiquement dès que l'hôte n'est pas local : une
    // DATABASE_URL pointant vers un hébergeur externe (Render, Heroku,
    // Supabase, ...) nécessite presque toujours SSL, indépendamment de
    // NODE_ENV. On ne dépend donc plus uniquement de config.env pour éviter
    // l'erreur "SSL/TLS required" quand NODE_ENV a été oublié.
    const requiresSsl = config.env === 'production' || !isLocalHost(config.database.url);

    return new Sequelize(config.database.url, {
      dialect: 'postgres',
      dialectOptions: requiresSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      ...commonOptions,
    });
  }

  const remoteHost = !['localhost', '127.0.0.1', '::1'].includes(config.database.host);
  const detailedRequiresSsl = config.env === 'production' || remoteHost;

  return new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    dialectOptions: detailedRequiresSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
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
