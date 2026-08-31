'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

function channelMention(id) {
  return id ? `<#${id}>` : '*Non configuré*';
}

module.exports = {
  name: 'greeting',
  aliases: ['bienvenue'],
  category: 'greeting',
  description: "Affiche ou configure les messages de bienvenue/départ (variables : {user}, {username}, {server}, {membercount}).",
  usage: 'show / join <#salon> <message> / leave <#salon> <message>',
  examples: ['show', 'join #arrivées Bienvenue {user} !', 'leave #départs {username} nous a quitté.'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  async execute(message, args) {
    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);

    if (args.length === 0 || args[0].toLowerCase() === 'show') {
      const embed = EmbedManager.build({
        title: '👋 Configuration Bienvenue / Départ',
        fields: [
          { name: 'Salon de bienvenue', value: channelMention(guildConfig.welcomeChannelId), inline: true },
          { name: 'Salon de départ', value: channelMention(guildConfig.leaveChannelId), inline: true },
          { name: 'Message de bienvenue', value: guildConfig.welcomeMessage || '*Message par défaut*' },
          { name: 'Message de départ', value: guildConfig.leaveMessage || '*Message par défaut*' },
        ],
      });
      return message.channel.send({ embeds: [embed] });
    }

    const type = args[0].toLowerCase();
    if (!['join', 'leave'].includes(type)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Utilisez `show`, `join <#salon> <message>` ou `leave <#salon> <message>`.')],
      });
    }

    const { resolveChannel } = require('../../utils/resolveChannel');
    const channel = resolveChannel(message, args[1]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    const text = args.slice(2).join(' ');
    if (!text) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez fournir le message.')] });
    }

    const field = type === 'join' ? 'welcomeChannelId' : 'leaveChannelId';
    const messageField = type === 'join' ? 'welcomeMessage' : 'leaveMessage';

    await GuildConfigService.update(message.guild.id, { [field]: channel.id, [messageField]: text });

    const embed = EmbedManager.success({
      title: '👋 Configuration mise à jour',
      description: `Le message de ${type === 'join' ? 'bienvenue' : 'départ'} sera envoyé dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
