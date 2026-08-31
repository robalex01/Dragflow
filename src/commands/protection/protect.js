'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { GuildMemberFlag } = require('../../database/models');

module.exports = {
  name: 'protect',
  aliases: ['proteger'],
  category: 'protection',
  description: 'Rend un membre immunisé contre le ban/kick/mute par les modérateurs.',
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const existing = await GuildMemberFlag.findOne({
      where: { guildId: message.guild.id, userId: target.id, flag: 'protected' },
    });

    if (existing) {
      await existing.destroy();
      const embed = EmbedManager.success({
        title: '🛡️ Protection retirée',
        description: `**${target.user.tag}** n'est plus protégé.`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    await GuildMemberFlag.create({ guildId: message.guild.id, userId: target.id, flag: 'protected' });
    const embed = EmbedManager.success({
      title: '🛡️ Membre protégé',
      description: `**${target.user.tag}** est maintenant immunisé contre le ban/kick/mute par les modérateurs.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
