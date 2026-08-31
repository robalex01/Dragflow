'use strict';

const EmbedManager = require('../managers/EmbedManager');
const GuildConfigService = require('../services/GuildConfigService');
const { AutoReact, PicOnlyChannel } = require('../database/models');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

function hasImage(message) {
  const hasImageAttachment = [...message.attachments.values()].some(
    (a) => a.contentType?.startsWith('image/') || IMAGE_EXTENSIONS.some((ext) => a.name?.toLowerCase().endsWith(ext))
  );
  const hasImageLink = IMAGE_EXTENSIONS.some((ext) => message.content.toLowerCase().includes(ext));
  return hasImageAttachment || hasImageLink;
}

async function checkDigicode(message, guildConfig) {
  if (!guildConfig.digicode || !guildConfig.digicodeRoleId) return false;
  if (message.content.trim() !== guildConfig.digicode) return false;

  const role = message.guild.roles.cache.get(guildConfig.digicodeRoleId);
  if (!role) return false;

  await message.delete().catch(() => null);

  if (message.member.roles.cache.has(role.id)) return true;

  await message.member.roles.add(role, 'Code digicode correct.').catch(() => null);
  const sent = await message.channel
    .send({
      embeds: [
        EmbedManager.success({
          title: '🔑 Code accepté',
          description: `${message.author}, vous avez reçu le rôle ${role} !`,
        }),
      ],
    })
    .catch(() => null);
  if (sent) setTimeout(() => sent.delete().catch(() => null), 6000);

  return true;
}

async function checkAutoReact(message) {
  const config = await AutoReact.findOne({ where: { guildId: message.guild.id, channelId: message.channel.id } });
  if (!config || config.emojis.length === 0) return;

  for (const emoji of config.emojis) {
    await message.react(emoji).catch(() => null);
  }
}

async function checkPicOnly(message) {
  const picOnly = await PicOnlyChannel.findOne({
    where: { guildId: message.guild.id, channelId: message.channel.id },
  });
  if (!picOnly) return false;
  if (hasImage(message)) return false;

  await message.delete().catch(() => null);
  const sent = await message.channel
    .send({
      embeds: [
        EmbedManager.warning({
          title: '🖼️ Salon images uniquement',
          description: `${message.author}, ce salon n'accepte que les images.`,
        }),
      ],
    })
    .catch(() => null);
  if (sent) setTimeout(() => sent.delete().catch(() => null), 6000);

  return true;
}

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);

    if (await checkDigicode(message, guildConfig)) return;
    if (await checkPicOnly(message)) return;

    await checkAutoReact(message);
  },
};
