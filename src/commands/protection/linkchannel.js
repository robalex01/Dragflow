'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'linkchannel',
  aliases: [],
  category: 'protection',
  description: "Définit un salon exempté de l'AntiLien (ou retire l'exemption avec `off`).",
  usage: '<#salon/off>',
  examples: ['#liens', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { linkAllowedChannelId: null });
      const embed = EmbedManager.success({ title: '🔗 Salon d\'exemption retiré', description: "L'AntiLien s'applique de nouveau partout." });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { linkAllowedChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '🔗 Salon exempté défini',
      description: `Les liens sont désormais autorisés dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
