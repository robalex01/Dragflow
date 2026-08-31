'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'voicemanager',
  aliases: ['vmanager'],
  category: 'configuration',
  description: 'Définit le salon vocal "hub" : tout membre qui le rejoint obtient un salon vocal temporaire personnel.',
  usage: '<#salon vocal/off>',
  examples: ['#Rejoindre-pour-créer', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels', 'MoveMembers'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { voiceManagerChannelId: null });
      const embed = EmbedManager.success({ title: '🔊 VoiceManager désactivé', description: 'Aucun salon "hub" configuré.' });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel || !channel.isVoiceBased()) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon vocal introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { voiceManagerChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '🔊 VoiceManager configuré',
      description: `Rejoindre ${channel} créera désormais un salon vocal temporaire personnel.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
