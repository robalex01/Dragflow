'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const inviteTracker = require('../../services/InviteTrackerService');

module.exports = {
  name: 'addinvites',
  aliases: [],
  category: 'invite',
  description: "Ajoute des invitations bonus à un membre.",
  usage: '<@membre/id> <quantité>',
  examples: ['@Utilisateur 5'],
  permission: 'moderator',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });

    const amount = Number(args[1]);
    if (!Number.isInteger(amount) || amount <= 0) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez indiquer un nombre entier positif.')] });
    }

    const data = await inviteTracker.getOrCreate(message.guild.id, target.id);
    data.bonus += amount;
    await data.save();
    await inviteTracker.checkRewards(message.guild, target.id);

    const embed = EmbedManager.success({
      title: '📨 Invitations ajoutées',
      description: `**${target.user.tag}** a maintenant **${inviteTracker.netInvites(data)}** invitation(s) nette(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
