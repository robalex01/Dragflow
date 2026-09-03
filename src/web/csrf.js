'use strict';

const crypto = require('crypto');
const { config } = require('../config/config');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Protection CSRF par double-soumission : un token est généré côté session
 * (serveur) et renvoyé dans un cookie lisible par le frontend, qui doit le
 * renvoyer dans l'en-tête X-CSRF-Token sur toute requête de mutation.
 * Un attaquant tiers ne peut pas lire ce cookie (same-origin policy) et ne
 * peut donc pas fabriquer l'en-tête requis.
 */
function ensureCsrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.cookie('dragflow.csrf', req.session.csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  next();
}

function verifyCsrfToken(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const headerToken = req.get('X-CSRF-Token');
  if (!headerToken || !req.session.csrfToken || headerToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'csrf_invalid', message: 'Jeton de sécurité invalide ou manquant.' });
  }
  next();
}

module.exports = { ensureCsrfToken, verifyCsrfToken };
