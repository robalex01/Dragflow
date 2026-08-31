'use strict';

const EmbedManager = require('../managers/EmbedManager');
const GuildConfigService = require('../services/GuildConfigService');
const CounterService = require('../services/CounterService');
const { applyVariables } = require('../utils/messageVariables');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    const guildConfig = await GuildConfigService.getOrCreate(member.guild.id);

    if (guildConfig.leaveChannelId) {
      const channel = member.guild.channels.cache.get(guildConfig.leaveChannelId);
      if (channel && channel.isTextBased()) {
        const content = applyVariables(
          guildConfig.leaveMessage || '**{username}** a quitté **{server}**. Nous sommes maintenant {membercount} membres.',
          { member, guild: member.guild }
        );
        await channel.send({
          embeds: [
            EmbedManager.warning({
              title: '👋 Départ',
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
