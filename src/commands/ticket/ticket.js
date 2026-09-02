'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');
const TicketService = require('../../services/TicketService');
const { TicketConfig } = require('../../database/models');

function channelMention(id) {
  return id ? `<#${id}>` : '*Non configuré*';
}

module.exports = {
  name: 'ticket',
  aliases: [],
  category: 'ticket',
  description: "Envoie le panel de création de ticket, ou configure le système (`setup`/`show`).",
  usage: 'panel / setup <#catégorie> <@rôle1> [@rôle2...] / show',
  examples: ['panel', 'setup Support @Staff', 'show'],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels', 'ManageRoles'],
  cooldown: 3,
  async execute(message, args) {
    const sub = (args[0] || 'panel').toLowerCase();
    const config = await TicketService.getConfig(message.guild.id);

    if (sub === 'show') {
      const embed = EmbedManager.build({
        title: '🎫 Configuration des tickets',
        fields: [
          { name: 'Catégorie', value: config.categoryId ? `<#${config.categoryId}>` : '*Aucune*', inline: true },
          { name: 'Salon de logs', value: channelMention(config.logChannelId), inline: true },
          {
            name: 'Rôles support',
            value: config.supportRoleIds.length > 0 ? config.supportRoleIds.map((id) => `<@&${id}>`).join(', ') : '*Aucun*',
          },
          { name: 'Prochain numéro', value: `#${config.nextTicketNumber}` },
        ],
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'setup') {
      const categoryArg = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      const roles = args
        .slice(2)
        .map((a) => resolveRole(message.guild, a))
        .filter(Boolean);

      if (categoryArg) config.categoryId = categoryArg.id;
      if (roles.length > 0) config.supportRoleIds = roles.map((r) => r.id);
      await config.save();

      const embed = EmbedManager.success({
        title: '🎫 Configuration mise à jour',
        description: `Catégorie : ${config.categoryId ? `<#${config.categoryId}>` : '*non définie*'}\nRôles support : ${
          config.supportRoleIds.length > 0 ? config.supportRoleIds.map((id) => `<@&${id}>`).join(', ') : '*aucun*'
        }`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    // panel (par défaut)
    const embed = TicketService.buildPanelEmbed(message.guild);
    const row = TicketService.buildPanelRow();
    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    config.panelChannelId = message.channel.id;
    config.panelMessageId = sent.id;
    await config.save();
  },
};
