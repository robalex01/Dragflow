'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'ticketload',
  aliases: [],
  category: 'ticket',
  description: 'Republie le panel de tickets (utile si le message original a été supprimé).',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  cooldown: 5,
  async execute(message) {
    const config = await TicketService.getConfig(message.guild.id);

    const embed = TicketService.buildPanelEmbed(message.guild);
    const row = TicketService.buildPanelRow();
    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    config.panelChannelId = message.channel.id;
    config.panelMessageId = sent.id;
    await config.save();

    const confirm = EmbedManager.success({ title: '🎫 Panel republié', description: `Le panel de tickets a été republié dans ${message.channel}.` });
    const sentConfirm = await message.channel.send({ embeds: [confirm] });
    setTimeout(() => sentConfirm.delete().catch(() => null), 5000);
  },
};
