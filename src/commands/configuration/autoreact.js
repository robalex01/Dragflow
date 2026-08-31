'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const { AutoReact } = require('../../database/models');

module.exports = {
  name: 'autoreact',
  aliases: [],
  category: 'configuration',
  description: 'Configure des réactions automatiques sur tous les messages d\'un salon.',
  usage: 'add <#salon> <emoji1> [emoji2...] / remove <#salon> / list',
  examples: ['add #général 👍 👎', 'remove #général', 'list'],
  permission: 'moderator',
  userPermissions: ['ManageMessages'],
  botPermissions: ['AddReactions'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === 'list') {
      const configs = await AutoReact.findAll({ where: { guildId: message.guild.id } });
      if (configs.length === 0) {
        return message.channel.send({
          embeds: [EmbedManager.build({ title: '⚡ AutoReact', description: 'Aucune réaction automatique configurée.' })],
        });
      }
      const embed = EmbedManager.build({
        title: '⚡ AutoReact configurés',
        fields: configs.map((c) => ({ name: `<#${c.channelId}>`, value: c.emojis.join(' ') || 'Aucun' })),
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const channel = resolveChannel(message, args[1]);
      if (!channel) return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });

      await AutoReact.destroy({ where: { guildId: message.guild.id, channelId: channel.id } });
      const embed = EmbedManager.success({ title: '⚡ AutoReact retiré', description: `Les réactions automatiques de ${channel} ont été retirées.` });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'add') {
      const channel = resolveChannel(message, args[1]);
      if (!channel) return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });

      const emojis = args.slice(2);
      if (emojis.length === 0) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez fournir au moins un emoji.')] });
      }

      const [config] = await AutoReact.findOrCreate({
        where: { guildId: message.guild.id, channelId: channel.id },
        defaults: { emojis },
      });
      config.emojis = emojis;
      await config.save();

      const embed = EmbedManager.success({
        title: '⚡ AutoReact configuré',
        description: `Chaque nouveau message dans ${channel} recevra : ${emojis.join(' ')}`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send({
      embeds: [EmbedManager.genericError('Sous-commande invalide. Utilisez `add`, `remove` ou `list`.')],
    });
  },
};
