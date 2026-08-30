'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

const MAX_PREFIX_LENGTH = 5;

module.exports = {
  name: 'prefix',
  aliases: [],
  category: 'configuration',
  description: 'Affiche ou modifie le préfixe utilisé par le bot sur ce serveur.',
  usage: '[nouveau préfixe]',
  examples: ['', '!'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  async execute(message, args) {
    const currentPrefix = await GuildConfigService.getPrefix(message.guild.id);

    if (args.length === 0) {
      const embed = EmbedManager.build({
        title: '⚙️ Préfixe du serveur',
        description: `Le préfixe actuel de ce serveur est : \`${currentPrefix}\`\n\nPour le changer : \`${currentPrefix}prefix <nouveau préfixe>\``,
      });
      return message.channel.send({ embeds: [embed] });
    }

    const newPrefix = args[0];

    if (newPrefix.length > MAX_PREFIX_LENGTH) {
      const embed = EmbedManager.genericError(
        `Le préfixe ne peut pas dépasser ${MAX_PREFIX_LENGTH} caractères.`
      );
      return message.channel.send({ embeds: [embed] });
    }

    if (/\s/.test(newPrefix)) {
      const embed = EmbedManager.genericError('Le préfixe ne peut pas contenir d\'espace.');
      return message.channel.send({ embeds: [embed] });
    }

    await GuildConfigService.setPrefix(message.guild.id, newPrefix);

    const embed = EmbedManager.success({
      title: '✅ Préfixe modifié',
      description: `Le préfixe de ce serveur est maintenant : \`${newPrefix}\`\n\nExemple : \`${newPrefix}help\``,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
