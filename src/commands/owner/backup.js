'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const BackupService = require('../../services/BackupService');

module.exports = {
  name: 'backup',
  aliases: [],
  category: 'owner',
  description: 'Crée une sauvegarde de la structure du serveur (salons et rôles).',
  usage: '',
  examples: [''],
  permission: 'administrator',
  cooldown: 30,
  async execute(message) {
    const backup = await BackupService.createBackup(message.guild);

    const embed = EmbedManager.success({
      title: '💾 Sauvegarde créée',
      description: `Sauvegarde **#${backup.id}** créée : ${backup.data.roles.length} rôle(s), ${backup.data.channels.length} salon(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
