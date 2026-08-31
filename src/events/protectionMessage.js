'use strict';

const EmbedManager = require('../managers/EmbedManager');
const ModLogService = require('../services/ModLogService');
const ProtectionService = require('../services/ProtectionService');
const GuildConfigService = require('../services/GuildConfigService');
const { spamMessages } = require('../managers/SpamTracker');
const { PATTERNS } = require('../utils/patterns');
const { BadWord } = require('../database/models');

const SPAM_WINDOW_MS = 5000;
const SPAM_MAX_MESSAGES = 6;
const SPAM_TIMEOUT_MS = 30 * 1000;

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.jar', '.msi', '.ps1'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];

async function warnAndDelete(message, title, description) {
  await message.delete().catch(() => null);
  const embed = EmbedManager.warning({ title, description });
  const sent = await message.channel.send({ embeds: [embed] }).catch(() => null);
  if (sent) setTimeout(() => sent.delete().catch(() => null), 6000);
}

async function checkAntileak(message, settings) {
  const antileak = settings.antileak || {};
  const content = message.content;

  if (antileak.token && PATTERNS.DISCORD_TOKEN.test(content)) {
    await warnAndDelete(
      message,
      '🛡️ AntiLeak — Token détecté',
      `${message.author}, un token semble avoir été partagé. Le message a été supprimé par sécurité.`
    );
    await ModLogService.send(message.guild, {
      title: '🛡️ AntiLeak — Token détecté',
      color: '#E74C3C',
      fields: [{ name: 'Membre', value: `${message.author.tag}` }, { name: 'Salon', value: `${message.channel}` }],
    });
    return true;
  }

  if (antileak.ipv4 && PATTERNS.IPV4.test(content)) {
    await warnAndDelete(message, '🛡️ AntiLeak — Adresse IP détectée', `${message.author}, une adresse IP a été détectée et supprimée.`);
    return true;
  }

  if (antileak.email && PATTERNS.EMAIL.test(content)) {
    await warnAndDelete(message, '🛡️ AntiLeak — E-mail détecté', `${message.author}, une adresse e-mail a été détectée et supprimée.`);
    return true;
  }

  if (antileak.phone && PATTERNS.PHONE.test(content)) {
    await warnAndDelete(message, '🛡️ AntiLeak — Numéro détecté', `${message.author}, un numéro de téléphone a été détecté et supprimé.`);
    return true;
  }

  return false;
}

async function checkAntiInvite(message) {
  if (!PATTERNS.DISCORD_INVITE.test(message.content)) return false;
  await warnAndDelete(
    message,
    '🚫 AntiInvite',
    `${message.author}, les invitations Discord ne sont pas autorisées sur ce serveur.`
  );
  return true;
}

async function checkAntiLink(message) {
  if (!PATTERNS.URL.test(message.content)) return false;
  await warnAndDelete(message, '🚫 AntiLien', `${message.author}, les liens ne sont pas autorisés sur ce serveur.`);
  return true;
}

async function checkBadWords(message) {
  const badWords = await BadWord.findAll({ where: { guildId: message.guild.id } });
  if (badWords.length === 0) return false;

  const lowerContent = message.content.toLowerCase();
  const matched = badWords.find((bw) => {
    const regex = new RegExp(`\\b${bw.word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(lowerContent);
  });

  if (!matched) return false;

  await warnAndDelete(message, '🤬 Langage inapproprié', `${message.author}, votre message contenait un mot interdit sur ce serveur.`);
  return true;
}

async function checkAntiSpam(message) {
  const key = `${message.guild.id}:${message.author.id}`;
  const count = spamMessages.hit(key, SPAM_WINDOW_MS);

  if (count <= SPAM_MAX_MESSAGES) return false;

  spamMessages.reset(key);
  await message.delete().catch(() => null);

  const member = message.member;
  if (member && member.moderatable) {
    await member.timeout(SPAM_TIMEOUT_MS, 'AntiSpam automatique').catch(() => null);
  }

  const embed = EmbedManager.warning({
    title: '🚫 AntiSpam',
    description: `${message.author} a été mis en sourdine temporairement pour spam.`,
  });
  const sent = await message.channel.send({ embeds: [embed] }).catch(() => null);
  if (sent) setTimeout(() => sent.delete().catch(() => null), 6000);

  await ModLogService.send(message.guild, {
    title: '🚫 AntiSpam déclenché',
    fields: [{ name: 'Membre', value: `${message.author.tag}` }, { name: 'Salon', value: `${message.channel}` }],
  });

  return true;
}

async function checkImgMod(message) {
  if (message.attachments.size === 0) return false;

  for (const attachment of message.attachments.values()) {
    const name = attachment.name?.toLowerCase() || '';
    const isDangerous = DANGEROUS_EXTENSIONS.some((ext) => name.endsWith(ext));
    const looksLikeImage = IMAGE_EXTENSIONS.some((ext) => name.includes(ext));
    const mismatchedType =
      attachment.contentType && IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext)) &&
      !attachment.contentType.startsWith('image/');

    if (isDangerous && looksLikeImage) {
      await warnAndDelete(
        message,
        '🖼️ ImgMod — Fichier suspect',
        `${message.author}, un fichier déguisé en image a été détecté et supprimé.`
      );
      return true;
    }

    if (mismatchedType) {
      await warnAndDelete(
        message,
        '🖼️ ImgMod — Fichier suspect',
        `${message.author}, un fichier ne correspondant pas à son extension a été supprimé.`
      );
      return true;
    }
  }

  return false;
}

async function checkPfpRequired(message) {
  if (message.author.avatar) return false;

  await warnAndDelete(
    message,
    '🖼️ Photo de profil requise',
    `${message.author}, vous devez définir une photo de profil personnalisée pour écrire sur ce serveur.`
  );
  return true;
}

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    if (ProtectionService.isExempt(message.member)) return;

    const settings = await ProtectionService.getSettings(message.guild.id);
    const guildConfig = await GuildConfigService.getOrCreate(message.guild.id);

    if (settings.antileak && (await checkAntileak(message, settings))) return;
    if (
      settings.antiinvite &&
      message.channel.id !== guildConfig.inviteAllowedChannelId &&
      (await checkAntiInvite(message))
    )
      return;
    if (
      settings.antilink &&
      message.channel.id !== guildConfig.linkAllowedChannelId &&
      (await checkAntiLink(message))
    )
      return;
    if (await checkBadWords(message)) return;
    if (settings.imgmod && (await checkImgMod(message))) return;
    if (settings.pfpRequired && (await checkPfpRequired(message))) return;
    if (settings.antispam && (await checkAntiSpam(message))) return;
  },
};
