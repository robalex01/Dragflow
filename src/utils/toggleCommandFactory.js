'use strict';

const EmbedManager = require('../managers/EmbedManager');
const ProtectionService = require('../services/ProtectionService');

/**
 * Fabrique une commande simple de type "+xxx <on/off>" qui active/désactive
 * un booléen dans GuildConfig.protectionSettings. Évite de dupliquer la même
 * logique dans chaque commande de protection (antispam, antilink, ...).
 */
function createToggleCommand({ name, aliases = [], settingKey, label, emoji, description, examples }) {
  return {
    name,
    aliases,
    category: 'protection',
    description,
    usage: '<on/off>',
    examples: examples || ['on', 'off'],
    permission: 'administrator',
    userPermissions: ['ManageGuild'],
    cooldown: 3,
    args: { min: 1 },
    async execute(message, args) {
      const value = args[0].toLowerCase();
      if (!['on', 'off'].includes(value)) {
        return message.channel.send({
          embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')],
        });
      }

      const enabled = value === 'on';
      await ProtectionService.setEnabled(message.guild.id, settingKey, enabled);

      const embed = EmbedManager.success({
        title: `${emoji} ${label}`,
        description: `${label} est maintenant **${enabled ? 'activé 🟢' : 'désactivé 🔴'}** sur ce serveur.`,
      });
      return message.channel.send({ embeds: [embed] });
    },
  };
}

module.exports = { createToggleCommand };
