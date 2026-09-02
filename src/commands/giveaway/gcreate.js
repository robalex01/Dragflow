'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const GiveawayService = require('../../services/GiveawayService');
const { resolveChannel } = require('../../utils/resolveChannel');
const { parseDuration } = require('../../utils/parseDuration');
const { Giveaway } = require('../../database/models');

module.exports = {
  name: 'gcreate',
  aliases: ['giveawaycreate'],
  category: 'giveaway',
  description: 'Crée un giveaway dans un salon donné pour une durée déterminée.',
  usage: '<#salon> <temps> <gain>',
  examples: ['#giveaways 1h Nitro Discord'],
  permission: 'moderator',
  userPermissions: ['ManageGuild'],
  botPermissions: ['SendMessages', 'EmbedLinks'],
  cooldown: 5,
  args: { min: 3 },
  async execute(message, args) {
    const channel = resolveChannel(message, args[0]);
    if (!channel || !channel.isTextBased()) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    const durationMs = parseDuration(args[1]);
    if (!durationMs) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Durée invalide. Exemple : `1h`, `30m`, `2d`.')],
      });
    }

    const prize = args.slice(2).join(' ');
    const endsAt = new Date(Date.now() + durationMs);

    const giveaway = await Giveaway.create({
      guildId: message.guild.id,
      channelId: channel.id,
      hostId: message.author.id,
      prize,
      winnerCount: 1,
      endsAt,
    });

    const embed = GiveawayService.buildGiveawayEmbed(giveaway, 0);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`giveaway_join_${giveaway.id}`).setLabel('Participer').setEmoji('🎉').setStyle(ButtonStyle.Success)
    );

    const sent = await channel.send({ embeds: [embed], components: [row] });
    giveaway.messageId = sent.id;
    await giveaway.save();

    const confirmEmbed = EmbedManager.success({
      title: '🎉 Giveaway créé',
      description: `Giveaway **#${giveaway.id}** créé dans ${channel} pour **${prize}**.`,
    });
    return message.channel.send({ embeds: [confirmEmbed] });
  },
};
