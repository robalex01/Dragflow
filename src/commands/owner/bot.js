'use strict';

const EmbedManager = require('../../managers/EmbedManager');

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}j ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  name: 'bot',
  aliases: [],
  category: 'owner',
  description: 'Affiche des statistiques globales du bot, agrégées sur tous les serveurs.',
  usage: '',
  examples: [''],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args, { client }) {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const uniqueCommands = new Set(client.commands.values());

    const embed = EmbedManager.build({
      title: `🤖 ${client.user.username} — Vue d'ensemble globale`,
      thumbnail: client.user.displayAvatarURL(),
      fields: [
        { name: 'Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Utilisateurs (cumulés)', value: `${totalMembers}`, inline: true },
        { name: 'Commandes', value: `${uniqueCommands.size}`, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime), inline: true },
        { name: 'Mémoire utilisée', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} Mo`, inline: true },
        { name: 'Latence API', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      ],
      timestamp: true,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
