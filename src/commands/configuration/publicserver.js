'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'publicserver',
  aliases: [],
  category: 'configuration',
  description: 'Crée (ou révoque) une invitation permanente publique pour ce serveur.',
  usage: '<on/off>',
  examples: ['on', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  botPermissions: ['CreateInstantInvite'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const value = args[0].toLowerCase();
    if (!['on', 'off'].includes(value)) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')] });
    }

    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);

    if (value === 'off') {
      if (guildConfig.publicInviteCode) {
        const invite = message.guild.invites.cache.get(guildConfig.publicInviteCode);
        await invite?.delete('Serveur repassé en privé.').catch(() => null);
      }
      await GuildConfigService.update(message.guild.id, { publicInviteCode: null });
      const embed = EmbedManager.success({ title: '🌐 Serveur privé', description: "L'invitation publique a été révoquée." });
      return message.channel.send({ embeds: [embed] });
    }

    const invite = await message.channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
    await GuildConfigService.update(message.guild.id, { publicInviteCode: invite.code });

    const embed = EmbedManager.success({
      title: '🌐 Serveur rendu public',
      description: `Voici le lien d'invitation permanent : ${invite.url}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
