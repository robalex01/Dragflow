'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandPermission, CustomPermission } = require('../../database/models');

module.exports = {
  name: 'switchall',
  aliases: [],
  category: 'owner',
  description: 'Migre toutes les commandes utilisant une permission vers une autre permission.',
  usage: '<perm_source> <perm_destination>',
  examples: ['moderator helper'],
  permission: 'administrator',
  cooldown: 5,
  args: { min: 2 },
  async execute(message, args) {
    const source = args[0].toLowerCase();
    const destination = args[1].toLowerCase();

    const [count] = await CommandPermission.update(
      { permissionName: destination },
      { where: { guildId: message.guild.id, permissionName: source } }
    );

    const customPerm = await CustomPermission.findOne({ where: { guildId: message.guild.id, name: source } });
    if (customPerm) {
      customPerm.name = destination;
      await customPerm.save();
    }

    const embed = EmbedManager.success({
      title: '🔐 Migration de permission',
      description: `**${count}** commande(s) migrée(s) de \`${source}\` vers \`${destination}\`${customPerm ? ' (permission personnalisée renommée)' : ''}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
