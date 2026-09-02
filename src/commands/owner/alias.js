'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandAlias } = require('../../database/models');

module.exports = {
  name: 'alias',
  aliases: [],
  category: 'owner',
  description: 'Crée un alias personnalisé pour une commande existante sur ce serveur.',
  usage: '<commande> <alias> / remove <alias> / list',
  examples: ['ban bannir', 'remove bannir', 'list'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const sub = args[0].toLowerCase();

    if (sub === 'list') {
      const aliases = await CommandAlias.findAll({ where: { guildId: message.guild.id } });
      if (aliases.length === 0) {
        return message.channel.send({ embeds: [EmbedManager.build({ title: '🔤 Alias', description: 'Aucun alias configuré.' })] });
      }
      const embed = EmbedManager.build({
        title: '🔤 Alias configurés',
        description: aliases.map((a) => `\`${a.alias}\` → \`${a.commandName}\``).join('\n'),
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const alias = args[1]?.toLowerCase();
      const deleted = await CommandAlias.destroy({ where: { guildId: message.guild.id, alias } });
      const embed = deleted
        ? EmbedManager.success({ title: '🔤 Alias supprimé', description: `\`${alias}\` a été supprimé.` })
        : EmbedManager.genericError('Alias introuvable.');
      return message.channel.send({ embeds: [embed] });
    }

    // Création : +alias <commande> <alias>
    if (args.length < 2) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Utilisation : `+alias <commande> <alias>`.')] });
    }

    const commandName = args[0].toLowerCase();
    const aliasName = args[1].toLowerCase();

    if (!client.commands.has(commandName)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Commande \`${commandName}\` introuvable.`)] });
    }
    if (client.commands.has(aliasName)) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`\`${aliasName}\` est déjà un nom de commande.`)] });
    }

    const realName = client.commands.get(commandName).name;
    await CommandAlias.upsert({ guildId: message.guild.id, alias: aliasName, commandName: realName });

    const embed = EmbedManager.success({
      title: '🔤 Alias créé',
      description: `\`${aliasName}\` exécute maintenant \`${realName}\`.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
