'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomChoice } = require('../../utils/hash');

const SENTENCES = [
  "Le rapide renard brun saute par-dessus le chien paresseux.",
  "Discord est une plateforme de communication très populaire.",
  "La programmation demande de la patience et de la pratique.",
  "Le café du matin est indispensable pour bien commencer la journée.",
  "Les développeurs adorent résoudre des problèmes complexes.",
];

module.exports = {
  name: 'fasttype',
  aliases: ['speedtype'],
  category: 'game',
  description: 'Défi de vitesse de frappe : retapez la phrase le plus vite possible.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const sentence = randomChoice(SENTENCES);

    const embed = EmbedManager.build({
      title: '⌨️ Défi de frappe',
      description: `Retapez cette phrase le plus vite possible :\n\n\`\`\`${sentence}\`\`\`\nVous avez 30 secondes !`,
    });
    await message.channel.send({ embeds: [embed] });

    const startTime = Date.now();

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 30000,
    });

    collector.on('collect', async (m) => {
      if (m.content.trim() === sentence) {
        collector.stop('done');
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const words = sentence.split(' ').length;
        const wpm = Math.round((words / elapsedSeconds) * 60);

        const resultEmbed = EmbedManager.success({
          title: '⌨️ Bravo !',
          description: `${message.author} a retapé la phrase en **${elapsedSeconds.toFixed(2)}s** (~${wpm} mots/minute).`,
        });
        await message.channel.send({ embeds: [resultEmbed] });
      }
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'done') return;
      const timeoutEmbed = EmbedManager.genericError('Temps écoulé ! Personne n\'a retapé la phrase correctement à temps.');
      await message.channel.send({ embeds: [timeoutEmbed] });
    });
  },
};
