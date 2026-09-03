'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { config } = require('../config/config');
const Logger = require('../utils/Logger');
const { createSessionMiddleware, initSessionStore } = require('./session');
const { ensureCsrfToken, verifyCsrfToken } = require('./csrf');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { createGuildsRouter } = require('./routes/guilds');
const { createCommandsRouter } = require('./routes/commands');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Trop de tentatives, réessayez plus tard.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Trop de requêtes, ralentissez.' },
});

/**
 * Crée et configure l'application Express du dashboard. Reçoit `client`
 * (discord.js, déjà connecté) afin que les routes puissent l'utiliser
 * directement sans dupliquer la logique du bot.
 */
async function createWebServer(client) {
  await initSessionStore();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: config.dashboard.url,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(createSessionMiddleware());
  app.use(ensureCsrfToken);
  app.use('/api', apiLimiter);
  app.use('/api', verifyCsrfToken);

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/guilds', createGuildsRouter(client));
  app.use('/api/commands', createCommandsRouter(client));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // 404 générique pour les routes API inconnues
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'not_found', message: 'Route API introuvable.' });
  });

  // Gestionnaire d'erreurs global : jamais de stack trace ni de détail technique au client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    Logger.error('Erreur non gérée dans le serveur web du dashboard.', err);
    res.status(500).json({ error: 'internal_error', message: 'Une erreur interne est survenue.' });
  });

  return app;
}

async function startWebServer(client) {
  const app = await createWebServer(client);

  return new Promise((resolve) => {
    const server = app.listen(config.dashboard.port, () => {
      Logger.success(`Dashboard API démarrée sur le port ${config.dashboard.port}.`);
      resolve(server);
    });
  });
}

module.exports = { createWebServer, startWebServer };
