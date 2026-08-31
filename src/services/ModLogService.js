'use strict';

const EmbedManager = require('../managers/EmbedManager');
const GuildConfigService = require('./GuildConfigService');
const Logger = require('../utils/Logger');

/**
 * Centralise l'envoi des logs de modération dans le salon configuré par serveur
 * (GuildConfig.logChannels.moderation, avec repli sur logsChannelId).
 */
class ModLogService {
  static async send(guild, { title, fields, color }) {
    const guildConfig = await GuildConfigService.getOrCreate(guild.id);
    const channelId =
      (guildConfig.logChannels && guildConfig.logChannels.moderation) || guildConfig.logsChannelId;

    if (!channelId) return null;

    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return null;

    const embed = EmbedManager.build({
      title,
      fields,
      color,
      timestamp: true,
      footerText: `Logs de modération — ${guild.name}`,
    });

    return channel.send({ embeds: [embed] }).catch((error) => {
      Logger.error(`Impossible d'envoyer un log de modération sur ${guild.id}.`, error);
      return null;
    });
  }
}

module.exports = ModLogService;
