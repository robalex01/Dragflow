'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

const MAX_BULK_DELETE = 100;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

async function clearMessages(message, args) {
  const amount = Number(args[0]);
  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_BULK_DELETE) {
    return message.channel.send({
      embeds: [EmbedManager.genericError(`Indiquez un nombre entre 1 et ${MAX_BULK_DELETE}.`)],
    });
  }

  const target = args[1] ? await resolveMember(message.guild, args[1]) : null;

  const fetched = await message.channel.messages.fetch({ limit: MAX_BULK_DELETE });
  const now = Date.now();
  let toDelete = fetched.filter((m) => now - m.createdTimestamp < TWO_WEEKS_MS);
  if (target) toDelete = toDelete.filter((m) => m.author.id === target.id);
  toDelete = [...toDelete.values()].slice(0, amount);

  if (toDelete.length === 0) {
    return message.channel.send({
      embeds: [EmbedManager.genericError('Aucun message à supprimer (trop ancien ou introuvable).')],
    });
  }

  const deleted = await message.channel.bulkDelete(toDelete, true);

  await ModLogService.send(message.guild, {
    title: '🧹 Messages supprimés',
    fields: [
      { name: 'Salon', value: `${message.channel}`, inline: true },
      { name: 'Quantité', value: `${deleted.size}`, inline: true },
      { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
    ],
  });

  const embed = EmbedManager.success({
    title: '🧹 Messages supprimés',
    description: `**${deleted.size}** message(s) supprimé(s)${target ? ` de **${target.user.tag}**` : ''}.`,
  });
  const confirmation = await message.channel.send({ embeds: [embed] });
  setTimeout(() => confirmation.delete().catch(() => null), 5000);
}

async function clearBans(message, args) {
  const reason = args.slice(1).join(' ') || 'Purge globale des bannissements.';
  const bans = await message.guild.bans.fetch();

  let count = 0;
  for (const ban of bans.values()) {
    await message.guild.bans.remove(ban.user.id, reason).catch(() => null);
    count += 1;
  }

  await ModLogService.send(message.guild, {
    title: '🧹 Bannissements purgés',
    fields: [
      { name: 'Quantité', value: `${count}`, inline: true },
      { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
    ],
  });

  const embed = EmbedManager.success({
    title: '🧹 Bannissements purgés',
    description: `**${count}** bannissement(s) retiré(s).`,
  });
  return message.channel.send({ embeds: [embed] });
}

async function clearMutes(message) {
  const members = await message.guild.members.fetch();
  const muted = members.filter((m) => m.isCommunicationDisabled());

  let count = 0;
  for (const member of muted.values()) {
    await member.timeout(null, `${message.author.tag} : purge globale des mutes.`).catch(() => null);
    count += 1;
  }

  await ModLogService.send(message.guild, {
    title: '🧹 Mutes purgés',
    fields: [
      { name: 'Quantité', value: `${count}`, inline: true },
      { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
    ],
  });

  const embed = EmbedManager.success({
    title: '🧹 Mutes purgés',
    description: `**${count}** membre(s) démute(s).`,
  });
  return message.channel.send({ embeds: [embed] });
}

async function clearWarns(message, args) {
  const identifier = args[1];
  if (!identifier) {
    return message.channel.send({
      embeds: [EmbedManager.genericError('Précisez un membre, un ID, ou `all`.')],
    });
  }

  if (identifier.toLowerCase() === 'all') {
    const { Infraction } = require('../../database/models');
    const count = await Infraction.update(
      { active: false },
      { where: { guildId: message.guild.id, type: 'warn' } }
    );
    const embed = EmbedManager.success({
      title: '🧹 Avertissements purgés',
      description: `Tous les avertissements du serveur ont été retirés.`,
    });
    return message.channel.send({ embeds: [embed] });
  }

  const target = await resolveMember(message.guild, identifier);
  if (!target) {
    return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
  }

  await InfractionService.clearWarns(message.guild.id, target.id);

  const embed = EmbedManager.success({
    title: '🧹 Avertissements purgés',
    description: `Tous les avertissements de **${target.user.tag}** ont été retirés.`,
  });
  return message.channel.send({ embeds: [embed] });
}

module.exports = {
  name: 'clear',
  aliases: ['purge', 'clean'],
  category: 'moderation',
  description:
    'Supprime des messages, ou purge les bans/mutes/warns selon le sous-argument utilisé (`bans`, `mutes`, `warns`).',
  usage: '<nombre> [@membre] / bans [raison] / mutes / warns <@membre/id/all>',
  examples: ['50', 'bans', 'mutes', 'warns all'],
  permission: 'moderator',
  userPermissions: ['ManageMessages'],
  botPermissions: ['ManageMessages'],
  cooldown: 4,
  args: { min: 1 },
  async execute(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === 'bans') return clearBans(message, args);
    if (sub === 'mutes') return clearMutes(message);
    if (sub === 'warns') return clearWarns(message, args);

    return clearMessages(message, args);
  },
};
