'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CustomPermission } = require('../../database/models');
const { BASE_PERMISSIONS } = require('../../managers/PermissionManager');

module.exports = {
  name: 'newperm',
  aliases: [],
  category: 'owner',
  description: 'Crée une nouvelle permission personnalisée sur ce serveur.',
  usage: '<permission>',
  examples: ['vip'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const name = args[0].toLowerCase();

    if (BASE_PERMISSIONS.includes(name)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`\`${name}\` est déjà une permission de base.`)] });
    }

    const [, created] = await CustomPermission.findOrCreate({
      where: { guildId: message.guild.id, name },
      defaults: { holders: [] },
    });

    const embed = created
      ? EmbedManager.success({ title: '🔐 Permission créée', description: `La permission \`${name}\` a été créée. Utilisez \`+setperm ${name} <@role>\` pour l'attribuer.` })
      : EmbedManager.genericError(`La permission \`${name}\` existe déjà.`);
    return message.channel.send({ embeds: [embed] });
  },
};
