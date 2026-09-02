'use strict';

const EmbedManager = require('../managers/EmbedManager');
const LevelService = require('../services/LevelService');
const GuildConfigService = require('../services/GuildConfigService');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);
    if (!guildConfig.levelingEnabled) return;

    const result = await LevelService.addXpFromMessage(message.guild.id, message.author.id);
    if (result?.leveledUp) {
      const embed = EmbedManager.success({
        title: '🆙 Niveau supérieur !',
        description: `${message.author} passe au niveau **${result.newLevel}** !`,
      });
      const sent = await message.channel.send({ embeds: [embed] }).catch(() => null);
      if (sent) setTimeout(() => sent.delete().catch(() => null), 8000);
    }
  },
};
