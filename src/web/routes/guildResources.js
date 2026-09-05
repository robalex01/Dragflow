'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { requireGuildAccess } = require('../middleware/guildAccess');

function createGuildResourcesRouter(client) {
  const router = express.Router({ mergeParams: true });

  /**
   * Recherche de membres (pour les champs de type "Member"). Toujours
   * limité et filtré côté serveur — jamais de dump complet du serveur.
   */
  router.get('/members', requireAuth, requireGuildAccess(client), async (req, res) => {
    const search = (req.query.search || '').toString().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    let members = req.guild.members.cache;
    if (members.size === 0) {
      // Cache vide (peu probable avec l'intent GuildMembers, mais par sécurité) :
      members = await req.guild.members.fetch();
    }

    const filtered = [...members.values()]
      .filter(
        (m) =>
          !search ||
          m.user.username.toLowerCase().includes(search) ||
          m.displayName.toLowerCase().includes(search) ||
          m.id === search
      )
      .slice(0, limit)
      .map((m) => ({
        id: m.id,
        username: m.user.username,
        displayName: m.displayName,
        avatarUrl: m.displayAvatarURL(),
        bot: m.user.bot,
      }));

    res.json({ members: filtered });
  });

  router.get('/roles', requireAuth, requireGuildAccess(client), (req, res) => {
    const roles = [...req.guild.roles.cache.values()]
      .filter((r) => r.id !== req.guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => ({ id: r.id, name: r.name, color: r.hexColor, position: r.position }));

    res.json({ roles });
  });

  router.get('/channels', requireAuth, requireGuildAccess(client), (req, res) => {
    const typeFilter = req.query.type; // 'text' | 'voice' | undefined (tous)

    const channels = [...req.guild.channels.cache.values()]
      .filter((c) => {
        if (typeFilter === 'text') return c.isTextBased() && !c.isVoiceBased();
        if (typeFilter === 'voice') return c.isVoiceBased();
        return true;
      })
      .map((c) => ({ id: c.id, name: c.name, type: c.type }));

    res.json({ channels });
  });

  return router;
}

module.exports = { createGuildResourcesRouter };
