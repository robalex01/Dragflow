'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');

const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🍉', '🍋', '🍓', '🥝'];
const GRID_SIZE = 4; // 4x4 = 8 paires

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createGrid() {
  const pairs = SYMBOLS.slice(0, (GRID_SIZE * GRID_SIZE) / 2);
  return shuffle([...pairs, ...pairs]);
}

function buildButtons(grid, revealed, matched) {
  const rows = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < GRID_SIZE; c++) {
      const index = r * GRID_SIZE + c;
      const isVisible = revealed.includes(index) || matched.includes(index);
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`mp_${index}`)
          .setEmoji(isVisible ? grid[index] : '❓')
          .setStyle(matched.includes(index) ? ButtonStyle.Success : ButtonStyle.Secondary)
          .setDisabled(matched.includes(index))
      );
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  name: 'matchpairs',
  aliases: ['memory'],
  category: 'game',
  description: 'Jeu de mémoire en solo : retrouvez toutes les paires.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const grid = createGrid();
    let revealed = [];
    const matched = [];
    let attempts = 0;
    let locked = false;

    const embed = EmbedManager.build({
      title: '🧠 Memory — Trouvez les paires',
      description: `${message.author}, cliquez sur deux cartes pour les retourner.`,
    });
    const sent = await message.channel.send({ embeds: [embed], components: buildButtons(grid, revealed, matched) });

    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "Cette partie ne vous appartient pas.", ephemeral: true });
      }
      if (locked) return interaction.deferUpdate();

      const index = Number(interaction.customId.replace('mp_', ''));
      if (revealed.includes(index) || matched.includes(index)) return interaction.deferUpdate();

      revealed.push(index);

      if (revealed.length < 2) {
        return interaction.update({ components: buildButtons(grid, revealed, matched) });
      }

      attempts++;
      const [a, b] = revealed;

      if (grid[a] === grid[b]) {
        matched.push(a, b);
        revealed = [];

        if (matched.length === grid.length) {
          collector.stop('done');
          const winEmbed = EmbedManager.success({
            title: '🎉 Bravo !',
            description: `${message.author} a trouvé toutes les paires en **${attempts}** essais !`,
          });
          return interaction.update({ embeds: [winEmbed], components: buildButtons(grid, revealed, matched) });
        }

        return interaction.update({ components: buildButtons(grid, revealed, matched) });
      }

      locked = true;
      await interaction.update({ components: buildButtons(grid, revealed, matched) });
      setTimeout(async () => {
        revealed = [];
        locked = false;
        await sent.edit({ components: buildButtons(grid, revealed, matched) }).catch(() => null);
      }, 1500);
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'done') return;
      const timeoutEmbed = EmbedManager.genericError('Partie annulée : temps écoulé.');
      await sent.edit({ embeds: [timeoutEmbed] }).catch(() => null);
    });
  },
};
