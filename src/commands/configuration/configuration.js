'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

function channelMention(id) {
  return id ? `<#${id}>` : '*Non configuré*';
}

function roleMention(id) {
  return id ? `<@&${id}>` : '*Non configuré*';
}

function onOff(value) {
  return value ? '🟢 Activé' : '🔴 Désactivé';
}

module.exports = {
  name: 'configuration',
  aliases: ['config', 'settings'],
  category: 'configuration',
  description: 'Affiche un résumé de la configuration actuelle du serveur.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 5,
  async execute(message, args, { client }) {
    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);
    const protection = guildConfig.protectionSettings || {};

    const embed = EmbedManager.build({
      title: `⚙️ Configuration de ${message.guild.name}`,
      thumbnail: message.guild.iconURL(),
      fields: [
        { name: 'Préfixe', value: `\`${guildConfig.prefix}\``, inline: true },
        { name: 'Couleur des embeds', value: guildConfig.embedColor, inline: true },
        { name: 'Salon de logs', value: channelMention(guildConfig.logsChannelId), inline: true },
        { name: 'Salon de bienvenue', value: channelMention(guildConfig.welcomeChannelId), inline: true },
        { name: 'Salon de départ', value: channelMention(guildConfig.leaveChannelId), inline: true },
        { name: 'Auto-role', value: roleMention(guildConfig.autoRoleId), inline: true },
        { name: 'Anti-spam', value: onOff(protection.antispam), inline: true },
        { name: 'Anti-lien', value: onOff(protection.antilink), inline: true },
        { name: 'Anti-invitation', value: onOff(protection.antiinvite), inline: true },
        { name: 'Anti-alt', value: onOff(protection.antialt), inline: true },
        { name: 'Mode raid', value: onOff(protection.raidmode), inline: true },
        { name: 'Niveau de sécurité', value: `\`${protection.securityLevel || 'low'}\``, inline: true },
      ],
      client,
      footerText: 'Utilisez les commandes de configuration dédiées pour modifier ces paramètres.',
      timestamp: true,
    });

    await message.channel.send({ embeds: [embed] });
  },
};
