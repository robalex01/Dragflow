'use strict';

const session = require('express-session');
const SequelizeStoreFactory = require('connect-session-sequelize');
const { sequelize } = require('../database/database');
const { config } = require('../config/config');
const Logger = require('../utils/Logger');

const SequelizeStore = SequelizeStoreFactory(session.Store);

/**
 * Store de session persisté dans la même base (Postgres/SQLite) que le reste
 * du bot — survit aux redémarrages, pas de session en mémoire.
 */
const store = new SequelizeStore({
  db: sequelize,
  tableName: 'dashboard_sessions',
  checkExpirationInterval: 15 * 60 * 1000, // purge des sessions expirées toutes les 15 min
  expiration: 7 * 24 * 60 * 60 * 1000, // 7 jours
});

async function initSessionStore() {
  await store.sync();
  Logger.success('Store de session du dashboard synchronisé (dashboard_sessions).');
}

/**
 * Construit le middleware de session à la demande (et non au chargement du
 * module) : si le dashboard n'est pas configuré/démarré, on ne veut pas
 * construire express-session avec un secret manquant juste parce que ce
 * fichier a été require() transitivement (ex: via l'event handler).
 */
function createSessionMiddleware() {
  return session({
    name: 'dragflow.sid',
    secret: config.dashboard.sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  });
}

module.exports = { createSessionMiddleware, initSessionStore, store };
