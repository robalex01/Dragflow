'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');

const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

function isManageable(permissionsBitfield) {
  try {
    const bits = BigInt(permissionsBitfield);
    return (bits & ADMINISTRATOR) === ADMINISTRATOR || (bits & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

/**
 * Construit le routeur /api/guilds. Prend `client` (discord.js) en paramètre
 * afin de croiser les serveurs de l'utilisateur avec la présence réelle du bot.
 */
function createGuildsRouter(client) {
  const router = express.Router();

  router.get('/', requireAuth, (req, res) => {
    const userGuilds = req.session.userGuilds || [];

    const guilds = userGuilds.map((g) => {
      const botGuild = client.guilds.cache.get(g.id);
      return {
        id: g.id,
        name: g.name,
        iconUrl: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        owner: g.owner,
        manageable: isManageable(g.permissions),
        botPresent: Boolean(botGuild),
        memberCount: botGuild ? botGuild.memberCount : null,
      };
    });

    res.json({ guilds });
  });

  return router;
}

module.exports = { createGuildsRouter };
