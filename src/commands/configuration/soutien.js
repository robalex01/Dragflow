'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'soutien',
  aliases: ['supportlink'],
  category: 'configuration',
  description: "Définit (ou affiche) le lien du serveur de support utilisé par la commande +support.",
  usage: '[lien]',
  examples: ['', 'https://discord.gg/exemple'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  async execute(message, args) {
    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);

    if (args.length === 0) {
      const embed = EmbedManager.build({
        title: '🆘 Lien de soutien',
        description: guildConfig.supportInvite || 'Aucun lien de support configuré.',
      });
      return message.channel.send({ embeds: [embed] });
    }

    await GuildConfigService.update(message.guild.id, { supportInvite: args[0] });
    const embed = EmbedManager.success({
      title: '🆘 Lien de soutien mis à jour',
      description: `Le lien de support est maintenant : ${args[0]}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
