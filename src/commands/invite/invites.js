'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const inviteTracker = require('../../services/InviteTrackerService');

module.exports = {
  name: 'invites',
  aliases: ['invitations'],
  category: 'invite',
  description: "Affiche le nombre d'invitations d'un membre.",
  usage: '[@membre/id]',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args) {
    const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const data = await inviteTracker.getOrCreate(message.guild.id, target.id);
    const net = inviteTracker.netInvites(data);

    const embed = EmbedManager.build({
      title: `📨 Invitations de ${target.user.username}`,
      fields: [
        { name: 'Invitations nettes', value: `${net}`, inline: true },
        { name: 'Invitations réelles', value: `${data.invites}`, inline: true },
        { name: 'Départs', value: `${data.leaves}`, inline: true },
        { name: 'Bonus', value: `${data.bonus}`, inline: true },
      ],
    });
    return message.channel.send({ embeds: [embed] });
  },
};
