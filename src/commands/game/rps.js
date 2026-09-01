'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { randomChoice } = require('../../utils/hash');

const CHOICES = { rock: '🪨 Pierre', paper: '📄 Feuille', scissors: '✂️ Ciseaux' };

function getWinner(choiceA, choiceB) {
  if (choiceA === choiceB) return null;
  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  return beats[choiceA] === choiceB ? 'A' : 'B';
}

function buildRow(disabled = false) {
  return new ActionRowBuilder().addComponents(
    Object.entries(CHOICES).map(([key, label]) =>
      new ButtonBuilder().setCustomId(`rps_${key}`).setLabel(label).setStyle(ButtonStyle.Primary).setDisabled(disabled)
    )
  );
}

module.exports = {
  name: 'rps',
  aliases: ['ppc', 'pierrefeuilleciseaux'],
  category: 'game',
  description: 'Défie un membre (ou le bot) à pierre-feuille-ciseaux.',
  usage: '<@membre>',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args) {
    const opponent = args[0] ? await resolveMember(message.guild, args[0]) : null;
    const vsBot = !opponent || opponent.id === message.client.user.id;

    if (opponent && opponent.id === message.author.id) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Vous ne pouvez pas jouer contre vous-même.')] });
    }

    const playerA = message.author;
    const playerB = vsBot ? message.client.user : opponent.user;
    const choices = {};

    const embed = EmbedManager.build({
      title: '✂️ Pierre-Feuille-Ciseaux',
      description: vsBot
        ? `${playerA} affronte le bot ! Faites votre choix.`
        : `${playerA} défie ${playerB} ! Chacun doit cliquer sur son choix en privé (via le bouton).`,
    });

    const sent = await message.channel.send({ embeds: [embed], components: [buildRow()] });

    if (vsBot) {
      choices.B = randomChoice(Object.keys(CHOICES));
    }

    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (interaction) => {
      const isA = interaction.user.id === playerA.id;
      const isB = !vsBot && interaction.user.id === playerB.id;

      if (!isA && !isB) {
        return interaction.reply({ content: "Vous ne participez pas à cette partie.", ephemeral: true });
      }

      const key = interaction.customId.replace('rps_', '');
      if (isA) choices.A = key;
      if (isB) choices.B = key;

      await interaction.reply({ content: `Vous avez choisi ${CHOICES[key]} !`, ephemeral: true });

      if (choices.A && choices.B) collector.stop('done');
    });

    collector.on('end', async (_collected, reason) => {
      if (reason !== 'done') {
        const embedTimeout = EmbedManager.genericError('Partie annulée : temps écoulé ou choix manquant.');
        return sent.edit({ embeds: [embedTimeout], components: [buildRow(true)] }).catch(() => null);
      }

      const winner = getWinner(choices.A, choices.B);
      let resultText;
      if (!winner) resultText = "Égalité !";
      else if (winner === 'A') resultText = `${playerA} gagne !`;
      else resultText = `${playerB} gagne !`;

      const resultEmbed = EmbedManager.success({
        title: '✂️ Résultat',
        description: `${playerA} : ${CHOICES[choices.A]}\n${playerB} : ${CHOICES[choices.B]}\n\n**${resultText}**`,
      });
      await sent.edit({ embeds: [resultEmbed], components: [buildRow(true)] }).catch(() => null);
    });
  },
};
