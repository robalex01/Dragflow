'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveUser } = require('../../utils/resolveUser');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'unban',
  aliases: ['debannir'],
  category: 'moderation',
  description: "Débannit un utilisateur du serveur à partir de son ID.",
  usage: '<id> [raison]',
  examples: ['123456789012345678 erreur de bannissement'],
  permission: 'moderator',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  cooldown: 4,
  args: { min: 1 },
  async execute(message, args) {
    const user = await resolveUser(message.client, args[0]);
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    if (!user) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Utilisateur introuvable (ID invalide).')] });
    }

    const banEntry = await message.guild.bans.fetch(user.id).catch(() => null);
    if (!banEntry) {
      return message.channel.send({ embeds: [EmbedManager.genericError("Cet utilisateur n'est pas banni.")] });
    }

    await message.guild.bans.remove(user.id, `${message.author.tag} : ${reason}`);

    await InfractionService.create({
      guildId: message.guild.id,
      userId: user.id,
      moderatorId: message.author.id,
      type: 'unban',
      reason,
    });

    await ModLogService.send(message.guild, {
      title: '✅ Membre débanni',
      color: '#2ECC71',
      fields: [
        { name: 'Membre', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    const embed = EmbedManager.success({
      title: '✅ Membre débanni',
      description: `**${user.tag}** a été débanni du serveur.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
