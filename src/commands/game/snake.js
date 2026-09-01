'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { randomInt } = require('../../utils/hash');

const SIZE = 8;

function randomEmptyCell(snake) {
  let cell;
  do {
    cell = { x: randomInt(0, SIZE - 1), y: randomInt(0, SIZE - 1) };
  } while (snake.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

function renderBoard(snake, food) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill('⬛'));
  snake.forEach((s, i) => {
    if (s.x >= 0 && s.x < SIZE && s.y >= 0 && s.y < SIZE) grid[s.y][s.x] = i === 0 ? '🟢' : '🟩';
  });
  if (food.y >= 0 && food.y < SIZE) grid[food.y][food.x] = '🍎';
  return grid.map((row) => row.join('')).join('\n');
}

function buildControls(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('snake_up').setEmoji('⬆️').setStyle(ButtonStyle.Primary).setDisabled(disabled)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('snake_left').setEmoji('⬅️').setStyle(ButtonStyle.Primary).setDisabled(disabled),
      new ButtonBuilder().setCustomId('snake_down').setEmoji('⬇️').setStyle(ButtonStyle.Primary).setDisabled(disabled),
      new ButtonBuilder().setCustomId('snake_right').setEmoji('➡️').setStyle(ButtonStyle.Primary).setDisabled(disabled)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('snake_quit').setLabel('Abandonner').setStyle(ButtonStyle.Danger).setDisabled(disabled)
    ),
  ];
}

module.exports = {
  name: 'snake',
  aliases: [],
  category: 'game',
  description: 'Jeu du serpent au tour par tour, avec boutons directionnels.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    let snake = [{ x: 4, y: 4 }];
    let direction = { x: 1, y: 0 };
    let food = randomEmptyCell(snake);
    let score = 0;

    const embed = EmbedManager.build({
      title: `🐍 Snake — Score : ${score}`,
      description: `${message.author}, utilisez les flèches pour diriger le serpent.\n\n${renderBoard(snake, food)}`,
    });
    const sent = await message.channel.send({ embeds: [embed], components: buildControls() });

    const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "Cette partie ne vous appartient pas.", ephemeral: true });
      }

      if (interaction.customId === 'snake_quit') {
        collector.stop('quit');
        const quitEmbed = EmbedManager.build({ title: '🐍 Partie terminée', description: `Score final : **${score}**.` });
        return interaction.update({ embeds: [quitEmbed], components: buildControls(true) });
      }

      const directions = {
        snake_up: { x: 0, y: -1 },
        snake_down: { x: 0, y: 1 },
        snake_left: { x: -1, y: 0 },
        snake_right: { x: 1, y: 0 },
      };
      const newDirection = directions[interaction.customId];

      // Empêche de faire demi-tour direct sur soi-même
      if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
        direction = newDirection;
      }

      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE;
      const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);

      if (hitWall || hitSelf) {
        collector.stop('gameover');
        const overEmbed = EmbedManager.error({
          title: '🐍 Game Over',
          description: `${message.author} s'est écrasé ! Score final : **${score}**.`,
        });
        return interaction.update({ embeds: [overEmbed], components: buildControls(true) });
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score++;
        food = randomEmptyCell(snake);
      } else {
        snake.pop();
      }

      const nextEmbed = EmbedManager.build({
        title: `🐍 Snake — Score : ${score}`,
        description: `${message.author}, utilisez les flèches pour diriger le serpent.\n\n${renderBoard(snake, food)}`,
      });
      return interaction.update({ embeds: [nextEmbed], components: buildControls() });
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'gameover' || reason === 'quit') return;
      const timeoutEmbed = EmbedManager.genericError(`Partie terminée : temps écoulé. Score final : ${score}.`);
      await sent.edit({ embeds: [timeoutEmbed], components: buildControls(true) }).catch(() => null);
    });
  },
};
