'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'invitechannel',
  aliases: [],
  category: 'protection',
  description: "Définit un salon exempté de l'AntiInvite (ou retire l'exemption avec `off`).",
  usage: '<#salon/off>',
  examples: ['#partenariats', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { inviteAllowedChannelId: null });
      const embed = EmbedManager.success({ title: '📨 Salon d\'exemption retiré', description: "L'AntiInvite s'applique de nouveau partout." });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { inviteAllowedChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '📨 Salon exempté défini',
      description: `Les invitations Discord sont désormais autorisées dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
