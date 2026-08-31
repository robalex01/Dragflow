'use strict';

const { AuditLogEvent } = require('discord.js');
const EmbedManager = require('../managers/EmbedManager');
const ModLogService = require('../services/ModLogService');
const ProtectionService = require('../services/ProtectionService');
const { PermissionManager } = require('../managers/PermissionManager');
const { firewallActions } = require('../managers/SpamTracker');
const { config } = require('../config/config');

const DESTRUCTIVE_ACTIONS = new Set([
  AuditLogEvent.ChannelDelete,
  AuditLogEvent.RoleDelete,
  AuditLogEvent.MemberBanAdd,
  AuditLogEvent.MemberKick,
  AuditLogEvent.WebhookCreate,
]);

const WINDOW_MS = 10 * 1000;
const THRESHOLD = 3;

module.exports = {
  name: 'guildAuditLogEntryCreate',
  once: false,
  async execute(auditLogEntry, guild) {
    const settings = await ProtectionService.getSettings(guild.id);
    if (!settings.firewall) return;

    if (!DESTRUCTIVE_ACTIONS.has(auditLogEntry.action)) return;

    const executorId = auditLogEntry.executorId;
    if (!executorId) return;
    if (executorId === guild.ownerId) return;
    if (executorId === guild.client.user.id) return;
    if (PermissionManager.isBotOwner(executorId)) return;

    const key = `${guild.id}:${executorId}`;
    const count = firewallActions.hit(key, WINDOW_MS);

    if (count < THRESHOLD) return;
    firewallActions.reset(key);

    const executorMember = await guild.members.fetch(executorId).catch(() => null);

    if (executorMember) {
      const botMember = guild.members.me;
      const canSanction = executorMember.roles.highest.position < botMember.roles.highest.position;

      if (canSanction) {
        await executorMember.roles.remove(
          executorMember.roles.cache.filter((r) => r.id !== guild.id),
          'Firewall : actions destructrices en rafale détectées.'
        ).catch(() => null);

        await executorMember.ban({ reason: 'Firewall : actions destructrices en rafale détectées.' }).catch(() => null);
      }
    }

    await ModLogService.send(guild, {
      title: '🚨 Firewall déclenché — Anti-Nuke',
      color: '#E74C3C',
      fields: [
        { name: 'Exécutant', value: `<@${executorId}> (${executorId})` },
        { name: 'Actions détectées', value: `${count} action(s) destructrice(s) en ${WINDOW_MS / 1000}s` },
        { name: 'Sanction', value: executorMember ? 'Rôles retirés + bannissement' : 'Membre déjà hors serveur' },
      ],
    });
  },
};
