'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'sethelp',
  aliases: [],
  category: 'configuration',
  description: "Définit un message personnalisé affiché en bas de la commande +help (ou `off` pour le retirer).",
  usage: '<message/off>',
  examples: ['Besoin d\'aide ? Rejoignez notre serveur de support !', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { helpMessage: null });
      const embed = EmbedManager.success({ title: '❓ Message +help retiré', description: 'Aucun message personnalisé.' });
      return message.channel.send({ embeds: [embed] });
    }

    const text = args.join(' ').substring(0, 500);
    await GuildConfigService.update(message.guild.id, { helpMessage: text });

    const embed = EmbedManager.success({
      title: '❓ Message +help mis à jour',
      description: `Le message suivant apparaîtra désormais dans \`+help\` :\n\n${text}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
