'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const ProtectionService = require('../../services/ProtectionService');

const VALID_LEVELS = ['low', 'medium', 'max'];

module.exports = {
  name: 'secur',
  aliases: ['securite', 'security'],
  category: 'protection',
  description: 'Définit un niveau de sécurité global qui active plusieurs protections en une seule commande.',
  usage: '<low/medium/max>',
  examples: ['medium'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const level = args[0].toLowerCase();
    if (!VALID_LEVELS.includes(level)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(`Niveau invalide. Utilisez : ${VALID_LEVELS.join(', ')}.`)],
      });
    }

    await ProtectionService.setSecurityLevel(message.guild.id, level);

    const descriptions = {
      low: 'Aucune protection automatique supplémentaire (sécurité minimale).',
      medium: 'AntiSpam, AntiLien et AntiInvite activés.',
      max: 'AntiSpam, AntiLien, AntiInvite, AntiAlt, Firewall, ImgMod et Mode raid activés.',
    };

    const embed = EmbedManager.success({
      title: `🛡️ Niveau de sécurité : ${level.toUpperCase()}`,
      description: descriptions[level],
    });
    return message.channel.send({ embeds: [embed] });
  },
};
