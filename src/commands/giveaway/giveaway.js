'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { Giveaway, GiveawayParticipant } = require('../../database/models');

module.exports = {
  name: 'giveaway',
  aliases: ['giveaways', 'gliste'],
  category: 'giveaway',
  description: 'Liste les giveaways actifs sur ce serveur.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 3,
  async execute(message) {
    const giveaways = await Giveaway.findAll({ where: { guildId: message.guild.id, ended: false } });

    if (giveaways.length === 0) {
      return message.channel.send({
        embeds: [EmbedManager.build({ title: '🎉 Giveaways actifs', description: 'Aucun giveaway en cours.' })],
      });
    }

    const fields = [];
    for (const g of giveaways) {
      const count = await GiveawayParticipant.count({ where: { giveawayId: g.id } });
      fields.push({
        name: `#${g.id} — ${g.prize}`,
        value: `<#${g.channelId}> — Fin <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:R> — ${count} participant(s)`,
      });
    }

    const embed = EmbedManager.build({ title: '🎉 Giveaways actifs', fields });
    return message.channel.send({ embeds: [embed] });
  },
};
