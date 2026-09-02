'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { DisabledCommand } = require('../../database/models');

module.exports = {
  name: 'disable',
  aliases: [],
  category: 'owner',
  description: 'Désactive (ou réactive si déjà désactivée) une commande sur ce serveur.',
  usage: '<commande>',
  examples: ['fun'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const commandName = args[0].toLowerCase();

    if (!client.commands.has(commandName)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Commande \`${commandName}\` introuvable.`)] });
    }
    if (commandName === 'disable') {
      return message.channel.send({ embeds: [EmbedManager.genericError('Vous ne pouvez pas désactiver cette commande.')] });
    }

    const realName = client.commands.get(commandName).name;
    const existing = await DisabledCommand.findOne({ where: { guildId: message.guild.id, commandName: realName } });

    if (existing) {
      await existing.destroy();
      const embed = EmbedManager.success({ title: '✅ Commande réactivée', description: `\`${realName}\` est de nouveau utilisable.` });
      return message.channel.send({ embeds: [embed] });
    }

    await DisabledCommand.create({ guildId: message.guild.id, commandName: realName });
    const embed = EmbedManager.success({ title: '⛔ Commande désactivée', description: `\`${realName}\` est maintenant désactivée sur ce serveur.` });
    return message.channel.send({ embeds: [embed] });
  },
};
