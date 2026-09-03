'use strict';

require('dotenv').config();

const { version: pkgVersion } = require('../../package.json');

/**
 * Configuration centrale du bot.
 * Toute valeur sensible provient EXCLUSIVEMENT des variables d'environnement.
 * Ne jamais hardcoder de token, clé API ou identifiant sensible ici.
 */

function parseIdList(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

const config = {
  bot: {
    token: process.env.DISCORD_TOKEN || null,
    clientId: process.env.CLIENT_ID || null,
    defaultPrefix: process.env.DEFAULT_PREFIX || '+',
    ownerIds: parseIdList(process.env.OWNER_IDS),
    version: pkgVersion,
  },

  embeds: {
    color: process.env.EMBED_COLOR || '#3498DB',
    colorSuccess: process.env.EMBED_COLOR_SUCCESS || '#2ECC71',
    colorError: process.env.EMBED_COLOR_ERROR || '#E74C3C',
    colorWarning: process.env.EMBED_COLOR_WARNING || '#F1C40F',
  },

  database: {
    dialect: process.env.DB_DIALECT || 'postgres',
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'dragflow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    sqliteStorage: process.env.SQLITE_STORAGE || './data/database.sqlite',
  },

  logging: {
    errorLogChannelId: process.env.ERROR_LOG_CHANNEL_ID || null,
  },

  support: {
    inviteUrl: process.env.SUPPORT_SERVER_INVITE || null,
  },

  dashboard: {
    enabled: process.env.DASHBOARD_ENABLED !== 'false',
    port: Number(process.env.DASHBOARD_PORT) || 3001,
    url: process.env.DASHBOARD_URL || 'http://localhost:5173',
    clientId: process.env.DISCORD_CLIENT_ID || null,
    clientSecret: process.env.DISCORD_CLIENT_SECRET || null,
    redirectUri: process.env.DISCORD_REDIRECT_URI || null,
    sessionSecret: process.env.SESSION_SECRET || null,
  },

  env: process.env.NODE_ENV || 'development',
};

function validateDashboardConfig() {
  if (!config.dashboard.enabled) return { ok: false, missing: [], disabled: true };

  const missing = [];
  if (!config.dashboard.clientId) missing.push('DISCORD_CLIENT_ID');
  if (!config.dashboard.clientSecret) missing.push('DISCORD_CLIENT_SECRET');
  if (!config.dashboard.redirectUri) missing.push('DISCORD_REDIRECT_URI');
  if (!config.dashboard.sessionSecret) missing.push('SESSION_SECRET');

  return { ok: missing.length === 0, missing, disabled: false };
}

function validateConfig() {
  const missing = [];

  if (!config.bot.token) missing.push('DISCORD_TOKEN');
  if (!config.bot.clientId) missing.push('CLIENT_ID');

  if (config.database.dialect === 'postgres' && !config.database.url) {
    const pgFields = ['DB_HOST', 'DB_NAME', 'DB_USER'];
    const hasDetailedConfig = pgFields.every((f) => !!process.env[f]);
    if (!hasDetailedConfig) {
      missing.push('DATABASE_URL (ou DB_HOST/DB_NAME/DB_USER/DB_PASSWORD)');
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Configuration invalide. Variables manquantes dans .env : ${missing.join(', ')}`
    );
  }
}

module.exports = { config, validateConfig, validateDashboardConfig };
