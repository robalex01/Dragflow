'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { randomChoice } = require('../../utils/hash');

const ACHIEVEMENTS = [
  { title: "Premiers pas", desc: "A rejoint le serveur avec succès." },
  { title: "Sociable", desc: "A envoyé son premier message." },
  { title: "Vétéran", desc: "Est membre du serveur depuis longtemps." },
  { title: "Explorateur", desc: "A visité tous les salons du serveur." },
  { title: "Ami des bots", desc: "Utilise activement les commandes du bot." },
];

module.exports = {
  name: 'advancement',
  aliases: [],
  category: 'game',
  description: 'Affiche un succès (style Minecraft) débloqué par un membre, pour le fun.',
  usage: '[@membre]',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args) {
    const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
    const user = target ? target.user : message.author;
    const achievement = randomChoice(ACHIEVEMENTS);

    const embed = EmbedManager.build({
      title: '🏆 Succès débloqué !',
      description: `**${user.username}** a obtenu le succès :\n\n**[${achievement.title}]**\n${achievement.desc}`,
      thumbnail: user.displayAvatarURL(),
    });
    return message.channel.send({ embeds: [embed] });
  },
};
