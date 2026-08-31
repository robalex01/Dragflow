'use strict';

const { ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { Counter } = require('../../database/models');
const CounterService = require('../../services/CounterService');

const VALID_TYPES = ['members', 'humans', 'bots', 'boosters'];

module.exports = {
  name: 'counter',
  aliases: ['compteur'],
  category: 'configuration',
  description: "Crée, liste ou supprime des salons-compteurs (membres/humains/bots/boosters).",
  usage: 'create <type> <gabarit avec {count}> / list / delete <#salon>',
  examples: ['create members Membres: {count}', 'list', 'delete #Membres:-42'],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === 'list') {
      const counters = await Counter.findAll({ where: { guildId: message.guild.id } });
      if (counters.length === 0) {
        return message.channel.send({
          embeds: [EmbedManager.build({ title: '🔢 Compteurs', description: 'Aucun compteur configuré.' })],
        });
      }
      const embed = EmbedManager.build({
        title: '🔢 Compteurs configurés',
        fields: counters.map((c) => ({
          name: `#${c.id} — ${c.type}`,
          value: `<#${c.channelId}> — gabarit : \`${c.template}\``,
        })),
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'delete') {
      const { resolveChannel } = require('../../utils/resolveChannel');
      const channel = resolveChannel(message, args[1]);
      if (!channel) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
      }
      const deleted = await Counter.destroy({ where: { guildId: message.guild.id, channelId: channel.id } });
      await channel.delete('Suppression du compteur.').catch(() => null);

      const embed = EmbedManager.success({
        title: '🔢 Compteur supprimé',
        description: deleted > 0 ? 'Le compteur a été supprimé.' : "Ce salon n'était pas un compteur enregistré (salon tout de même supprimé si possible).",
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'create') {
      const type = args[1]?.toLowerCase();
      if (!VALID_TYPES.includes(type)) {
        return message.channel.send({
          embeds: [EmbedManager.genericError(`Type invalide. Utilisez : ${VALID_TYPES.join(', ')}.`)],
        });
      }

      const template = args.slice(2).join(' ');
      if (!template.includes('{count}')) {
        return message.channel.send({
          embeds: [EmbedManager.genericError('Le gabarit doit contenir `{count}`. Exemple : `Membres: {count}`.')],
        });
      }

      const count = CounterService.computeCount(message.guild, type);
      const channel = await message.guild.channels.create({
        name: template.replace('{count}', count),
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
          { id: message.guild.id, deny: ['Connect'] },
        ],
      });

      await Counter.create({ guildId: message.guild.id, channelId: channel.id, type, template });

      const embed = EmbedManager.success({
        title: '🔢 Compteur créé',
        description: `Le salon ${channel} affichera désormais le nombre de **${type}**.`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send({
      embeds: [EmbedManager.genericError('Sous-commande invalide. Utilisez `create`, `list` ou `delete`.')],
    });
  },
};
