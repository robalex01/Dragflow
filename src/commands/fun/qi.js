'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { hashToPercent } = require('../../utils/hash');

module.exports = {
  name: 'qi',
  aliases: ['iq'],
  category: 'fun',
  description: "Calcule le QI (pour le fun) d'un membre.",
  usage: '[@membre]',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 2,
  async execute(message, args) {
    const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
    const user = target ? target.user : message.author;

    const score = 50 + Math.round(hashToPercent(user.id) * 1.5);

    const embed = EmbedManager.build({
      title: '🧠 Test de QI',
      description: `**${user.username}** a un QI de **${score}** !`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
