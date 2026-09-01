'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { randomInt } = require('../../utils/hash');

const SIZE = 5;
const MINES = 5;
const NUMBER_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

function createGrid() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  let placed = 0;
  while (placed < MINES) {
    const r = randomInt(0, SIZE - 1);
    const c = randomInt(0, SIZE - 1);
    if (grid[r][c] === 'mine') continue;
    grid[r][c] = 'mine';
    placed++;
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 'mine') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc] === 'mine') count++;
        }
      }
      grid[r][c] = count;
    }
  }
  return grid;
}

function buildButtons(grid, revealed, gameOver = false) {
  const rows = [];
  for (let r = 0; r < SIZE; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < SIZE; c++) {
      const key = `${r}-${c}`;
      const isRevealed = revealed.has(key);
      const cell = grid[r][c];

      let label = '⬜';
      let style = ButtonStyle.Secondary;
      if (isRevealed || gameOver) {
        if (cell === 'mine') {
          label = '💣';
          style = ButtonStyle.Danger;
        } else {
          label = NUMBER_EMOJIS[cell];
          style = ButtonStyle.Success;
        }
      }

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ms_${r}_${c}`)
          .setEmoji(label)
          .setStyle(style)
          .setDisabled(gameOver || isRevealed)
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  name: 'demineur',
  aliases: ['minesweeper'],
  category: 'game',
  description: `Joue au démineur en solo (grille ${SIZE}x${SIZE}, ${MINES} mines).`,
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const grid = createGrid();
    const revealed = new Set();
    const totalSafeCells = SIZE * SIZE - MINES;

    const embed = EmbedManager.build({
      title: '💣 Démineur',
      description: `${message.author}, cliquez sur les cases pour les révéler. Évitez les mines !`,
    });
    const sent = await message.channel.send({ embeds: [embed], components: buildButtons(grid, revealed) });

    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "Cette partie ne vous appartient pas.", ephemeral: true });
      }

      const [, r, c] = interaction.customId.split('_').map((v, i) => (i === 0 ? v : Number(v)));
      const key = `${r}-${c}`;
      revealed.add(key);

      if (grid[r][c] === 'mine') {
        collector.stop('lost');
        const loseEmbed = EmbedManager.error({
          title: '💥 Boom !',
          description: `${message.author} a touché une mine. Partie perdue !`,
        });
        return interaction.update({ embeds: [loseEmbed], components: buildButtons(grid, revealed, true) });
      }

      if (revealed.size === totalSafeCells) {
        collector.stop('won');
        const winEmbed = EmbedManager.success({
          title: '🎉 Victoire !',
          description: `${message.author} a déminé toute la grille sans exploser !`,
        });
        return interaction.update({ embeds: [winEmbed], components: buildButtons(grid, revealed, true) });
      }

      const continueEmbed = EmbedManager.build({
        title: '💣 Démineur',
        description: `${message.author}, continuez ! (${revealed.size}/${totalSafeCells} cases sûres révélées)`,
      });
      return interaction.update({ embeds: [continueEmbed], components: buildButtons(grid, revealed) });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'lost' || reason === 'won') return;
      const timeoutEmbed = EmbedManager.genericError('Partie annulée : temps écoulé.');
      await sent.edit({ embeds: [timeoutEmbed], components: buildButtons(grid, revealed, true) }).catch(() => null);
    });
  },
};
