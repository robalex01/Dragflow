'use strict';

const EmbedManager = require('../managers/EmbedManager');
const ModLogService = require('../services/ModLogService');
const ProtectionService = require('../services/ProtectionService');

const GHOSTPING_WINDOW_MS = 15 * 1000;

module.exports = {
  name: 'messageDelete',
  once: false,
  async execute(message) {
    if (!message.guild || message.author?.bot) return;
    if (message.mentions.users.size === 0 && message.mentions.roles.size === 0) return;

    const settings = await ProtectionService.getSettings(message.guild.id);
    if (!settings.ghostping) return;

    const age = Date.now() - message.createdTimestamp;
    if (age > GHOSTPING_WINDOW_MS) return;

    const mentionedUsers = [...message.mentions.users.values()].map((u) => `${u}`).join(', ') || 'Aucun';
    const mentionedRoles = [...message.mentions.roles.values()].map((r) => `${r}`).join(', ') || 'Aucun';

    await ModLogService.send(message.guild, {
      title: '👻 Ghost Ping détecté',
      color: '#9B59B6',
      fields: [
        { name: 'Auteur', value: message.author ? `${message.author.tag}` : 'Inconnu', inline: true },
        { name: 'Salon', value: `${message.channel}`, inline: true },
        { name: 'Supprimé après', value: `${Math.round(age / 1000)}s`, inline: true },
        { name: 'Utilisateurs mentionnés', value: mentionedUsers },
        { name: 'Rôles mentionnés', value: mentionedRoles },
        { name: 'Contenu', value: message.content ? message.content.substring(0, 1000) : '*Vide*' },
      ],
    });
  },
};
