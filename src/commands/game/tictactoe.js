'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((cell) => cell)) return 'draw';
  return null;
}

function buildBoard(board, disabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const index = r * 3 + c;
      const cell = board[index];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${index}`)
          .setLabel(cell || '\u200b')
          .setStyle(cell === 'X' ? ButtonStyle.Danger : cell === 'O' ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(disabled || Boolean(cell))
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  name: 'tictactoe',
  aliases: ['morpion', 'ttt'],
  category: 'game',
  description: 'Joue au morpion contre un autre membre.',
  usage: '<@membre>',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const opponent = await resolveMember(message.guild, args[0]);
    if (!opponent || opponent.id === message.author.id || opponent.user.bot) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Veuillez mentionner un adversaire valide (pas vous-même, pas un bot).')],
      });
    }

    const board = Array(9).fill(null);
    const players = { X: message.author, O: opponent.user };
    let turn = 'X';

    const embed = EmbedManager.build({
      title: '⭕ Morpion',
      description: `${players.X} (❌) vs ${players.O} (⭕)\nAu tour de ${players[turn]} (${turn}).`,
    });
    const sent = await message.channel.send({ embeds: [embed], components: buildBoard(board) });

    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

    collector.on('collect', async (interaction) => {
      const currentPlayer = players[turn];
      if (interaction.user.id !== currentPlayer.id) {
        return interaction.reply({ content: "Ce n'est pas votre tour.", ephemeral: true });
      }

      const index = Number(interaction.customId.replace('ttt_', ''));
      if (board[index]) return interaction.deferUpdate();

      board[index] = turn;
      const result = checkWinner(board);

      if (result) {
        collector.stop('done');
        const resultEmbed = EmbedManager.success({
          title: '⭕ Morpion — Partie terminée',
          description: result === 'draw' ? 'Match nul !' : `${players[result]} (${result}) a gagné ! 🎉`,
        });
        return interaction.update({ embeds: [resultEmbed], components: buildBoard(board, true) });
      }

      turn = turn === 'X' ? 'O' : 'X';
      const nextEmbed = EmbedManager.build({
        title: '⭕ Morpion',
        description: `${players.X} (❌) vs ${players.O} (⭕)\nAu tour de ${players[turn]} (${turn}).`,
      });
      return interaction.update({ embeds: [nextEmbed], components: buildBoard(board) });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'done') return;
      const timeoutEmbed = EmbedManager.genericError('Partie annulée : temps écoulé.');
      await sent.edit({ embeds: [timeoutEmbed], components: buildBoard(board, true) }).catch(() => null);
    });
  },
};
