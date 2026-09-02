'use strict';

const { ActivityType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const StatusRotationService = require('../../services/StatusRotationService');
const { config } = require('../../config/config');

module.exports = {
  name: 'resetstatut',
  aliases: [],
  category: 'owner',
  description: 'Réinitialise le statut du bot à sa valeur par défaut.',
  usage: '',
  examples: [''],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args, { client }) {
    await StatusRotationService.setEnabled(false);

    client.user.setActivity(`${config.bot.defaultPrefix}help | ${client.guilds.cache.size} serveurs`, {
      type: ActivityType.Watching,
    });

    const embed = EmbedManager.success({ title: '🔄 Statut réinitialisé', description: 'Le statut par défaut a été restauré.' });
    return message.channel.send({ embeds: [embed] });
  },
};
