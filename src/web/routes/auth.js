'use strict';

const express = require('express');
const crypto = require('crypto');
const { getAuthorizeUrl, exchangeCode, fetchDiscordUser, fetchUserGuilds } = require('../discordOAuth');
const { requireAuth } = require('../middleware/requireAuth');
const { config } = require('../../config/config');
const Logger = require('../../utils/Logger');

const router = express.Router();

/**
 * Étape 1 : redirige l'utilisateur vers Discord. Un `state` aléatoire est
 * stocké en session et revérifié au retour (protection CSRF du flux OAuth2).
 */
router.get('/discord', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  res.redirect(getAuthorizeUrl(state));
});

/**
 * Étape 2 : callback Discord. Échange le code, récupère l'utilisateur et ses
 * serveurs, puis crée la session. Le token d'accès Discord n'est JAMAIS
 * renvoyé au frontend — il reste stocké côté serveur dans la session.
 */
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${config.dashboard.url}/login?error=discord_denied`);
  }

  if (!code || !state || state !== req.session.oauthState) {
    return res.redirect(`${config.dashboard.url}/login?error=invalid_state`);
  }
  delete req.session.oauthState;

  try {
    const tokenData = await exchangeCode(code);
    const discordUser = await fetchDiscordUser(tokenData.access_token);
    const guilds = await fetchUserGuilds(tokenData.access_token);

    req.session.user = {
      id: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name || null,
      avatar: discordUser.avatar,
    };
    req.session.oauth = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };
    req.session.userGuilds = guilds.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
      permissions: g.permissions,
    }));

    req.session.save((err) => {
      if (err) {
        Logger.error('Impossible de sauvegarder la session après callback OAuth2.', err);
        return res.redirect(`${config.dashboard.url}/login?error=session_failed`);
      }
      res.redirect(`${config.dashboard.url}/servers`);
    });
  } catch (err) {
    Logger.error('Échec du callback OAuth2 Discord.', err);
    res.redirect(`${config.dashboard.url}/login?error=oauth_failed`);
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'logout_failed', message: 'Impossible de vous déconnecter.' });
    }
    res.clearCookie('dragflow.sid');
    res.json({ success: true });
  });
});

module.exports = router;
