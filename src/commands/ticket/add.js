'use strict';

const { PermissionsBitField } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { Ticket } = require('../../database/models');

module.exports = {
  name: 'add',
  aliases: [],
  category: 'ticket',
  description: 'Ajoute un membre au ticket courant.',
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const ticket = await Ticket.findOne({ where: { guildId: message.guild.id, channelId: message.channel.id } });
    if (!ticket) {
      return message.channel.send({ embeds: [EmbedManager.genericError("Ce salon n'est pas un ticket.")] });
    }

    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    await message.channel.permissionOverwrites.edit(target.id, {
      [PermissionsBitField.Flags.ViewChannel]: true,
      [PermissionsBitField.Flags.SendMessages]: true,
      [PermissionsBitField.Flags.ReadMessageHistory]: true,
    });

    const embed = EmbedManager.success({
      title: '➕ Membre ajouté',
      description: `${target} a été ajouté à ce ticket.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
