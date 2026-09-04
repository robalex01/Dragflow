'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { requireGuildAccess } = require('../middleware/guildAccess');
const GuildConfigService = require('../../services/GuildConfigService');
const { MemberStats } = require('../../database/models');

function createGuildDetailRouter(client) {
  const router = express.Router({ mergeParams: true });

  router.get('/', requireAuth, requireGuildAccess(client), async (req, res) => {
    const { guild } = req;
    const guildConfig = await GuildConfigService.getOrCreate(guild.id);

    const stats = await MemberStats.findAll({ where: { guildId: guild.id } });
    const totalMessages = stats.reduce((acc, d) => acc + d.messages, 0);

    res.json({
      id: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL(),
      memberCount: guild.memberCount,
      onlineBot: true,
      prefix: guildConfig.prefix,
      embedColor: guildConfig.embedColor,
      totalMessagesTracked: totalMessages,
      uptimeMs: client.uptime,
      permissions: req.guildPermissions,
    });
  });

  return router;
}

module.exports = { createGuildDetailRouter };
