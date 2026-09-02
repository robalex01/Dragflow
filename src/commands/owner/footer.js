'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const runtimeSettings = require('../../state/botRuntimeSettings');

module.exports = {
  name: 'footer',
  aliases: [],
  category: 'owner',
  description: 'Définit le footer par défaut utilisé dans tous les embeds du bot (affecte TOUS les serveurs).',
  usage: '[footer/off]',
  examples: ['Propulsé par Dragflow', 'off'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args) {
    if (args.length === 0) {
      const current = runtimeSettings.get().footerText;
      const embed = EmbedManager.build({ title: '📝 Footer actuel', description: current || '*Aucun footer personnalisé défini.*' });
      return message.channel.send({ embeds: [embed] });
    }

    if (args[0].toLowerCase() === 'off') {
      await runtimeSettings.setFooter(null);
      const embed = EmbedManager.success({ title: '📝 Footer retiré', description: 'Le footer par défaut a été retiré.' });
      return message.channel.send({ embeds: [embed] });
    }

    const text = args.join(' ').substring(0, 200);
    await runtimeSettings.setFooter(text);

    const embed = EmbedManager.success({ title: '📝 Footer mis à jour', description: `Le footer par défaut est maintenant :\n${text}` });
    return message.channel.send({ embeds: [embed] });
  },
};
