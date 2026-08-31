'use strict';

const { ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'unslowmodeall',
  aliases: [],
  category: 'moderation',
  description: 'Désactive le mode lent sur tous les salons textuels du serveur.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 10,
  async execute(message) {
    const textChannels = message.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);

    let count = 0;
    for (const channel of textChannels.values()) {
      if (channel.rateLimitPerUser > 0) {
        await channel.setRateLimitPerUser(0, `${message.author.tag} : +unslowmodeall`).catch(() => null);
        count += 1;
      }
    }

    await ModLogService.send(message.guild, {
      title: '🐌 Mode lent désactivé partout',
      fields: [{ name: 'Salons modifiés', value: `${count}` }, { name: 'Modérateur', value: `${message.author.tag}` }],
    });

    const embed = EmbedManager.success({
      title: '🐌 Mode lent désactivé',
      description: `Mode lent retiré sur **${count}** salon(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
