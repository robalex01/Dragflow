'use strict';

const { createToggleCommand } = require('../../utils/toggleCommandFactory');
const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'autobackup',
  aliases: [],
  category: 'owner',
  description: 'Active ou désactive la sauvegarde automatique quotidienne de la structure du serveur.',
  usage: '<on/off>',
  examples: ['on', 'off'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const value = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(value)) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')] });
    }

    await GuildConfigService.update(message.guild.id, { autoBackupEnabled: value === 'on' });

    const embed = EmbedManager.success({
      title: '💾 Sauvegarde automatique',
      description: `La sauvegarde automatique quotidienne est maintenant **${value === 'on' ? 'activée 🟢' : 'désactivée 🔴'}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
