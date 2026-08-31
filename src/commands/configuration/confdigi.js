'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'confdigi',
  aliases: ['digicodeconfig'],
  category: 'configuration',
  description: "Configure le système de digicode : un membre qui tape le code exact reçoit le rôle associé.",
  usage: '<code> <@rôle> / off',
  examples: ['1234 @Vérifié', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { digicode: null, digicodeRoleId: null });
      const embed = EmbedManager.success({ title: '🔑 Digicode désactivé', description: 'Le système de digicode a été désactivé.' });
      return message.channel.send({ embeds: [embed] });
    }

    if (args.length < 2) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Utilisation : `+confdigi <code> <@rôle>` ou `+confdigi off`.')],
      });
    }

    const code = args[0];
    const role = resolveRole(message.guild, args[1]);
    if (!role) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { digicode: code, digicodeRoleId: role.id });
    await message.delete().catch(() => null);

    const embed = EmbedManager.success({
      title: '🔑 Digicode configuré',
      description: `Tout membre qui écrira le bon code recevra désormais le rôle ${role}.`,
    });
    const sent = await message.channel.send({ embeds: [embed] });
    setTimeout(() => sent.delete().catch(() => null), 8000);
  },
};
