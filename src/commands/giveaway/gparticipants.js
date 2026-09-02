'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { paginate } = require('../../managers/PaginationManager');
const { Giveaway, GiveawayParticipant } = require('../../database/models');

const PER_PAGE = 20;

module.exports = {
  name: 'gparticipants',
  aliases: [],
  category: 'giveaway',
  description: "Liste les participants d'un giveaway.",
  usage: '<id>',
  examples: ['3'],
  permission: 'moderator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const id = Number(args[0]);
    const giveaway = await Giveaway.findOne({ where: { id, guildId: message.guild.id } });

    if (!giveaway) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Aucun giveaway #${id} trouvé.`)] });
    }

    const participants = await GiveawayParticipant.findAll({ where: { giveawayId: id } });

    if (participants.length === 0) {
      return message.channel.send({
        embeds: [EmbedManager.build({ title: `🎉 Participants — Giveaway #${id}`, description: 'Aucun participant pour le moment.' })],
      });
    }

    const pages = [];
    for (let i = 0; i < participants.length; i += PER_PAGE) {
      const slice = participants.slice(i, i + PER_PAGE);
      pages.push(
        EmbedManager.build({
          title: `🎉 Participants — Giveaway #${id} (${giveaway.prize})`,
          description: slice.map((p) => `<@${p.userId}>`).join('\n'),
          client,
          footerText: `Page ${pages.length + 1}/${Math.ceil(participants.length / PER_PAGE)} • ${participants.length} participant(s)`,
        })
      );
    }

    await paginate(message, pages);
  },
};
