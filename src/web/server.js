'use strict';

const path = require('path');
const fs = require('fs');
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
const { createGuildDetailRouter } = require('./routes/guildDetail');
const { createCommandsRouter } = require('./routes/commands');
const { createCategoriesRouter } = require('./routes/categories');

const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');

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
  app.use('/api/guilds/:guildId', createGuildDetailRouter(client));
  app.use('/api/commands', createCommandsRouter(client));
  app.use('/api/categories', createCategoriesRouter(client));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // 404 générique pour les routes API inconnues
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'not_found', message: 'Route API introuvable.' });
  });

  attachFrontend(app);

  // Gestionnaire d'erreurs global : jamais de stack trace ni de détail technique au client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    Logger.error('Erreur non gérée dans le serveur web du dashboard.', err);
    res.status(500).json({ error: 'internal_error', message: 'Une erreur interne est survenue.' });
  });

  return app;
}

/**
 * Sert le frontend React buildé (frontend/dist) sur le MÊME port que l'API.
 * Indispensable sur les hébergeurs qui n'exposent qu'un seul port (ex: un
 * plan gratuit type Wispbyte) : plus besoin d'un second service/domaine
 * pour le frontend. Si le build n'existe pas encore (dev sans `npm run
 * build` côté frontend), on l'indique clairement plutôt que de servir une
 * 404 muette.
 */
function attachFrontend(app) {
  const indexPath = path.join(FRONTEND_DIST, 'index.html');

  if (!fs.existsSync(indexPath)) {
    app.get('/', (req, res) => {
      res.status(200).send(
        'Dragflow Dashboard API : en ligne. Le frontend n\'a pas été buildé ' +
          '(exécutez `npm run build` dans le dossier frontend/, ou lancez `npm run dev` ' +
          'séparément pour le développement).'
      );
    });
    return;
  }

  app.use(express.static(FRONTEND_DIST));

  // Fallback SPA : toute route non-API renvoie index.html pour que React Router
  // gère le routage côté client (y compris après un rafraîchissement de page).
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(indexPath);
  });
}

async function startWebServer(client) {
  const app = await createWebServer(client);

  return new Promise((resolve) => {
    // Écoute explicitement sur 0.0.0.0 (toutes les interfaces) : certains
    // hébergeurs (dont les offres gratuites type Wispbyte) exigent ce binding
    // explicite et ne routent pas le trafic vers 127.0.0.1/localhost.
    const server = app.listen(config.dashboard.port, '0.0.0.0', () => {
      Logger.success(`Dashboard démarré sur 0.0.0.0:${config.dashboard.port}.`);
      resolve(server);
    });
  });
}

module.exports = { createWebServer, startWebServer };
