'use strict';

const os = require('os');
const EmbedManager = require('../../managers/EmbedManager');
const { config } = require('../../config/config');

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}j ${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

module.exports = {
  name: 'botinfo',
  aliases: ['infobot', 'about'],
  category: 'information',
  description: 'Affiche des informations générales sur le bot.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message, args, { client, prefix }) {
    const uniqueCommands = new Set(client.commands.values());
    const memberCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

    const embed = EmbedManager.build({
      title: `ℹ️ Informations sur ${client.user.username}`,
      thumbnail: client.user.displayAvatarURL(),
      fields: [
        { name: 'Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Utilisateurs (approx.)', value: `${memberCount}`, inline: true },
        { name: 'Commandes', value: `${uniqueCommands.size}`, inline: true },
        { name: 'Préfixe (ce serveur)', value: `\`${prefix}\``, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime), inline: true },
        { name: 'Mémoire utilisée', value: formatBytes(process.memoryUsage().heapUsed), inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Discord.js', value: `v${require('discord.js').version}`, inline: true },
        { name: 'Système', value: `${os.platform()} (${os.arch()})`, inline: true },
      ],
      client,
      footerText: 'SoulBot Clone — Bot Discord 100% préfixe',
      timestamp: true,
    });

    await message.channel.send({ embeds: [embed] });
  },
};
