'use strict';

const EmbedManager = require('../managers/EmbedManager');
const GuildConfigService = require('../services/GuildConfigService');
const CounterService = require('../services/CounterService');
const { applyVariables } = require('../utils/messageVariables');
const Logger = require('../utils/Logger');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    const guildConfig = await GuildConfigService.getOrCreate(member.guild.id);

    // Auto-role
    if (guildConfig.autoRoleId) {
      const role = member.guild.roles.cache.get(guildConfig.autoRoleId);
      if (role) {
        await member.roles.add(role, 'Auto-role').catch((error) => {
          Logger.error(`Impossible d'appliquer l'auto-role sur ${member.guild.id}.`, error);
        });
      }
    }

    // Message de bienvenue
    if (guildConfig.welcomeChannelId) {
      const channel = member.guild.channels.cache.get(guildConfig.welcomeChannelId);
      if (channel && channel.isTextBased()) {
        const content = applyVariables(
          guildConfig.welcomeMessage || 'Bienvenue {user} sur **{server}** ! Nous sommes maintenant {membercount} membres.',
          { member, guild: member.guild }
        );
        await channel.send({
          embeds: [
            EmbedManager.success({
              title: '👋 Nouveau membre',
              description: content,
              thumbnail: member.user.displayAvatarURL(),
            }),
          ],
        }).catch(() => null);
      }
    }

    await CounterService.updateAll(member.guild).catch(() => null);
  },
};
