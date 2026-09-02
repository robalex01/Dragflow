'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandPermission } = require('../../database/models');

module.exports = {
  name: 'switch',
  aliases: [],
  category: 'owner',
  description: 'Change la permission requise pour exécuter une commande sur ce serveur.',
  usage: '<permission> <commande>',
  examples: ['moderator warn'],
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
      title: '🔐 Permission de commande modifiée',
      description: `\`${realName}\` nécessite maintenant la permission \`${permissionName}\`.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
