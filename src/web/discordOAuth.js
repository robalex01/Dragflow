'use strict';

const { config } = require('../config/config');
const Logger = require('../utils/Logger');

const DISCORD_API = 'https://discord.com/api/v10';
const SCOPES = ['identify', 'guilds'];

/**
 * Construit l'URL d'autorisation Discord OAuth2 vers laquelle rediriger l'utilisateur.
 * `state` est un jeton anti-CSRF à usage unique, généré et vérifié côté session.
 */
function getAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: config.dashboard.clientId,
    redirect_uri: config.dashboard.redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
    prompt: 'consent',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Échange le code d'autorisation contre un access token (jamais exposé au frontend).
 */
async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id: config.dashboard.clientId,
    client_secret: config.dashboard.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.dashboard.redirectUri,
  });

  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    Logger.error(`Échange OAuth2 échoué (${response.status}): ${text}`);
    throw new Error('oauth_exchange_failed');
  }

  return response.json(); // { access_token, token_type, expires_in, refresh_token, scope }
}

async function fetchDiscordUser(accessToken) {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('discord_user_fetch_failed');
  return response.json();
}

async function fetchUserGuilds(accessToken) {
  const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('discord_guilds_fetch_failed');
  return response.json();
}

module.exports = { getAuthorizeUrl, exchangeCode, fetchDiscordUser, fetchUserGuilds };
