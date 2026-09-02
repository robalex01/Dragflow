'use strict';

const EmbedManager = require('../managers/EmbedManager');
const { resolveMember } = require('./resolveMember');
const { resolveUser } = require('./resolveUser');
const { GuildMemberFlag } = require('../database/models');

/**
 * Fabrique une paire de commandes add/remove pour un flag de GuildMemberFlag
 * (blacklist, whitelist, manager). Évite de dupliquer la même logique CRUD.
 */
function createFlagAddCommand({ name, aliases = [], flag, label, emoji, permission = 'administrator' }) {
  return {
    name,
    aliases,
    category: 'owner',
    description: `Ajoute (ou retire si déjà présent) un membre à la liste ${label}.`,
    usage: '[@membre/id]',
    examples: ['@Utilisateur'],
    permission,
    cooldown: 3,
    args: { min: 1 },
    async execute(message, args) {
      const target =
        (await resolveMember(message.guild, args[0])) || (await resolveUser(message.client, args[0]));
      if (!target) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
      }
      const userId = target.id;
      const userTag = target.user ? target.user.tag : target.tag;

      const existing = await GuildMemberFlag.findOne({ where: { guildId: message.guild.id, userId, flag } });
      if (existing) {
        await existing.destroy();
        const embed = EmbedManager.success({
          title: `${emoji} ${label} retiré`,
          description: `**${userTag}** n'est plus ${label}.`,
        });
        return message.channel.send({ embeds: [embed] });
      }

      await GuildMemberFlag.create({ guildId: message.guild.id, userId, flag });
      const embed = EmbedManager.success({
        title: `${emoji} ${label} ajouté`,
        description: `**${userTag}** est maintenant ${label}.`,
      });
      return message.channel.send({ embeds: [embed] });
    },
  };
}

function createFlagRemoveCommand({ name, aliases = [], flag, label, emoji, permission = 'administrator', supportAll = false }) {
  return {
    name,
    aliases,
    category: 'owner',
    description: `Retire un membre de la liste ${label}${supportAll ? ' (ou `all` pour vider la liste)' : ''}.`,
    usage: supportAll ? '<@membre/id/all>' : '<@membre/id>',
    examples: ['@Utilisateur'],
    permission,
    cooldown: 3,
    args: { min: 1 },
    async execute(message, args) {
      if (supportAll && args[0].toLowerCase() === 'all') {
        const count = await GuildMemberFlag.destroy({ where: { guildId: message.guild.id, flag } });
        const embed = EmbedManager.success({
          title: `${emoji} Liste ${label} vidée`,
          description: `**${count}** membre(s) retiré(s) de la liste ${label}.`,
        });
        return message.channel.send({ embeds: [embed] });
      }

      const target =
        (await resolveMember(message.guild, args[0])) || (await resolveUser(message.client, args[0]));
      if (!target) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
      }
      const userId = target.id;
      const userTag = target.user ? target.user.tag : target.tag;

      const deleted = await GuildMemberFlag.destroy({ where: { guildId: message.guild.id, userId, flag } });
      const embed = deleted
        ? EmbedManager.success({ title: `${emoji} ${label} retiré`, description: `**${userTag}** n'est plus ${label}.` })
        : EmbedManager.genericError(`**${userTag}** n'était pas ${label}.`);
      return message.channel.send({ embeds: [embed] });
    },
  };
}

module.exports = { createFlagAddCommand, createFlagRemoveCommand };
