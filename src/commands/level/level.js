'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');
const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

const toggle = createToggleCommand({
  name: 'level',
  settingKey: '__leveling__',
  label: 'Système de niveaux',
  emoji: '📊',
  description: "Active ou désactive le système de niveaux/XP sur ce serveur.",
});

module.exports = {
  ...toggle,
  async execute(message, args) {
    const value = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(value)) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')] });
    }

    await GuildConfigService.update(message.guild.id, { levelingEnabled: value === 'on' });

    const embed = EmbedManager.success({
      title: '📊 Système de niveaux',
      description: `Le système de niveaux est maintenant **${value === 'on' ? 'activé 🟢' : 'désactivé 🔴'}** sur ce serveur.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
