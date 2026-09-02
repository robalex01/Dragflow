'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandPermission } = require('../../database/models');

module.exports = {
  name: 'duperm',
  aliases: [],
  category: 'owner',
  description: 'Applique une permission existante à une commande supplémentaire (équivalent à +switch).',
  usage: '<permission> <commande>',
  examples: ['vip giveaway'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args, { client }) {
    const permissionName = args[0].toLowerCase();
    const commandName = args[1].toLowerCase();

    if (!client.commands.has(commandName)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Commande \`${commandName}\` introuvable.`)] });
    }
    const realName = client.commands.get(commandName).name;

    await CommandPermission.upsert({ guildId: message.guild.id, commandName: realName, permissionName });

    const embed = EmbedManager.success({
      title: '🔐 Permission dupliquée',
      description: `La commande \`${realName}\` requiert maintenant aussi la permission \`${permissionName}\`.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
