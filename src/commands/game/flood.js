'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'flood',
  aliases: ['compter'],
  category: 'game',
  description: "Lance un jeu de comptage collaboratif : le salon doit compter jusqu'à la cible sans erreur.",
  usage: '<cible>',
  examples: ['50'],
  permission: 'everyone',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const target = Number(args[0]);
    if (!Number.isInteger(target) || target < 5 || target > 500) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Veuillez indiquer une cible entre 5 et 500.')],
      });
    }

    let current = 0;
    let lastUserId = null;

    const embed = EmbedManager.build({
      title: '🔢 Flood — Comptage collaboratif',
      description: `Comptez ensemble jusqu'à **${target}** en tapant le nombre suivant ! Le premier à commencer tape \`1\`. Une même personne ne peut pas compter deux fois de suite.`,
    });
    await message.channel.send({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({ time: 5 * 60 * 1000 });

    collector.on('collect', async (m) => {
      if (m.author.bot) return;

      const number = Number(m.content.trim());
      if (!Number.isInteger(number)) return;

      if (number !== current + 1 || m.author.id === lastUserId) {
        collector.stop('failed');
        const failEmbed = EmbedManager.error({
          title: '💥 Flood raté !',
          description: `${m.author} a cassé le compte à **${current}** (attendu : ${current + 1}). Il fallait atteindre ${target}.`,
        });
        await message.channel.send({ embeds: [failEmbed] });
        return;
      }

      current = number;
      lastUserId = m.author.id;

      if (current >= target) {
        collector.stop('success');
        const winEmbed = EmbedManager.success({
          title: '🎉 Objectif atteint !',
          description: `Le salon a compté jusqu'à **${target}** avec succès !`,
        });
        await message.channel.send({ embeds: [winEmbed] });
      }
    });

    collector.on('end', async (_collected, reason) => {
      if (reason === 'success' || reason === 'failed') return;
      const timeoutEmbed = EmbedManager.genericError(`Flood terminé : temps écoulé. Compte atteint : ${current}.`);
      await message.channel.send({ embeds: [timeoutEmbed] });
    });
  },
};
