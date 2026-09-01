'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');

const COLS = 7;
const ROWS = 6;
const EMPTY = '⚪';
const DISCS = { R: '🔴', Y: '🟡' };

function createGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function dropDisc(grid, col, symbol) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!grid[r][col]) {
      grid[r][col] = symbol;
      return r;
    }
  }
  return -1;
}

function checkWinner(grid) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const symbol = grid[r][c];
      if (!symbol) continue;
      for (const [dr, dc] of directions) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== symbol) break;
          count++;
        }
        if (count >= 4) return symbol;
      }
    }
  }
  if (grid.every((row) => row.every((cell) => cell))) return 'draw';
  return null;
}

function renderGrid(grid) {
  return grid.map((row) => row.map((cell) => (cell ? DISCS[cell] : EMPTY)).join('')).join('\n');
}

function buildColumnButtons(grid, disabled = false) {
  const rows = [];
  for (let i = 0; i < 2; i++) {
    const row = new ActionRowBuilder();
    for (let c = i * 4; c < Math.min(COLS, i * 4 + 4); c++) {
      const full = grid[0][c] !== null;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`p4_${c}`)
          .setLabel(`${c + 1}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled || full)
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  name: 'puissance4',
  aliases: ['connect4', 'p4'],
  category: 'game',
  description: 'Joue à Puissance 4 contre un autre membre.',
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

    const grid = createGrid();
    const players = { R: message.author, Y: opponent.user };
    let turn = 'R';

    const embed = EmbedManager.build({
      title: '🔴 Puissance 4 🟡',
      description: `${players.R} 🔴 vs ${players.Y} 🟡\n\n${renderGrid(grid)}\n\nAu tour de ${players[turn]}.`,
    });
    const sent = await message.channel.send({ embeds: [embed], components: buildColumnButtons(grid) });

    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

    collector.on('collect', async (interaction) => {
      const currentPlayer = players[turn];
      if (interaction.user.id !== currentPlayer.id) {
        return interaction.reply({ content: "Ce n'est pas votre tour.", ephemeral: true });
      }

      const col = Number(interaction.customId.replace('p4_', ''));
      const row = dropDisc(grid, col, turn);
      if (row === -1) return interaction.deferUpdate();

      const result = checkWinner(grid);

      if (result) {
        collector.stop('done');
        const resultEmbed = EmbedManager.success({
          title: '🔴 Puissance 4 🟡 — Terminé',
          description: `${renderGrid(grid)}\n\n${
            result === 'draw' ? 'Match nul !' : `${players[result]} a gagné ! 🎉`
          }`,
        });
        return interaction.update({ embeds: [resultEmbed], components: buildColumnButtons(grid, true) });
      }

      turn = turn === 'R' ? 'Y' : 'R';
      const nextEmbed = EmbedManager.build({
        title: '🔴 Puissance 4 🟡',
        description: `${players.R} 🔴 vs ${players.Y} 🟡\n\n${renderGrid(grid)}\n\nAu tour de ${players[turn]}.`,
      });
      return interaction.update({ embeds: [nextEmbed], components: buildColumnButtons(grid) });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'done') return;
      const timeoutEmbed = EmbedManager.genericError('Partie annulée : temps écoulé.');
      await sent.edit({ embeds: [timeoutEmbed], components: buildColumnButtons(grid, true) }).catch(() => null);
    });
  },
};
