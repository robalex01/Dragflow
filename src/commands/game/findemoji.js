'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { randomInt, randomChoice } = require('../../utils/hash');

const EMOJIS = ['😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤯', '🥶', '🤩', '😱', '🙃'];

module.exports = {
  name: 'findemoji',
  aliases: [],
  category: 'game',
  description: "Trouvez le seul emoji différent parmi la grille le plus vite possible.",
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const gridSize = 9;
    const commonEmoji = randomChoice(EMOJIS);
    let oddEmoji = randomChoice(EMOJIS);
    while (oddEmoji === commonEmoji) oddEmoji = randomChoice(EMOJIS);

    const oddIndex = randomInt(0, gridSize - 1);
    const grid = Array(gridSize).fill(commonEmoji);
    grid[oddIndex] = oddEmoji;

    const embed = EmbedManager.build({
      title: '🔍 Trouvez l\'emoji différent',
      description: `${message.author}, cliquez sur l'emoji qui est différent des autres !`,
    });

    const rows = [];
    for (let i = 0; i < 3; i++) {
      const row = new ActionRowBuilder();
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        row.addComponents(
          new ButtonBuilder().setCustomId(`fe_${index}`).setEmoji(grid[index]).setStyle(ButtonStyle.Secondary)
        );
      }
      rows.push(row);
    }

    const sent = await message.channel.send({ embeds: [embed], components: rows });
    const startTime = Date.now();

    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "Ce défi ne vous appartient pas.", ephemeral: true });
      }

      const index = Number(interaction.customId.replace('fe_', ''));
      collector.stop('answered');

      if (index === oddIndex) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const winEmbed = EmbedManager.success({
          title: '🔍 Bien joué !',
          description: `Trouvé en **${elapsed}s** !`,
        });
        return interaction.update({ embeds: [winEmbed], components: [] });
      }

      const loseEmbed = EmbedManager.error({ title: '🔍 Raté !', description: "Ce n'était pas le bon emoji." });
      return interaction.update({ embeds: [loseEmbed], components: [] });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'answered') return;
      const timeoutEmbed = EmbedManager.genericError('Temps écoulé !');
      await sent.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => null);
    });
  },
};
