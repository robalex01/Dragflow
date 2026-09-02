'use strict';

const { ChannelType, PermissionsBitField, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const EmbedManager = require('../managers/EmbedManager');
const { Ticket, TicketConfig } = require('../database/models');
const Logger = require('../utils/Logger');

class TicketService {
  static async getConfig(guildId) {
    const [config] = await TicketConfig.findOrCreate({ where: { guildId } });
    return config;
  }

  static buildPanelEmbed(guild) {
    return EmbedManager.build({
      title: '🎫 Support',
      description: "Besoin d'aide ? Cliquez sur le bouton ci-dessous pour ouvrir un ticket privé avec l'équipe de support.",
      thumbnail: guild.iconURL(),
    });
  }

  static buildPanelRow() {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_create').setLabel('Créer un ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary)
    );
  }

  static buildTicketWelcomeRow() {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger)
    );
  }

  /**
   * Vrai si l'utilisateur a déjà un ticket ouvert sur ce serveur (évite les doublons).
   */
  static async hasOpenTicket(guildId, userId) {
    const existing = await Ticket.findOne({ where: { guildId, ownerId: userId, status: 'open' } });
    return Boolean(existing);
  }

  static async createTicket(guild, member) {
    const config = await this.getConfig(guild.id);

    if (await this.hasOpenTicket(guild.id, member.id)) {
      return { error: 'already_open' };
    }

    const overwrites = [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      {
        id: member.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
      },
      {
        id: guild.members.me.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
      },
    ];

    for (const roleId of config.supportRoleIds) {
      overwrites.push({
        id: roleId,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
      });
    }

    const number = config.nextTicketNumber;
    const channel = await guild.channels.create({
      name: `ticket-${number}`,
      type: ChannelType.GuildText,
      parent: config.categoryId || null,
      permissionOverwrites: overwrites,
    });

    config.nextTicketNumber = number + 1;
    await config.save();

    const ticket = await Ticket.create({
      guildId: guild.id,
      channelId: channel.id,
      ownerId: member.id,
      number,
      status: 'open',
    });

    const supportMentions = config.supportRoleIds.map((id) => `<@&${id}>`).join(' ');
    const embed = EmbedManager.build({
      title: `🎫 Ticket #${number}`,
      description: `Bienvenue ${member}, un membre du support va vous répondre bientôt.\n${supportMentions}`,
    });

    await channel.send({
      content: `${member} ${supportMentions}`.trim(),
      embeds: [embed],
      components: [this.buildTicketWelcomeRow()],
    });

    return { ticket, channel };
  }

  /**
   * Génère un transcript texte simple (100 derniers messages) sous forme de fichier.
   */
  static async generateTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
    if (!messages) return null;

    const lines = [...messages.values()]
      .reverse()
      .map((m) => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content || '[embed/pièce jointe]'}`);

    const content = lines.join('\n') || 'Aucun message.';
    return new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: `transcript-${channel.name}.txt` });
  }

  static async closeTicket(channel, ticket, closedBy) {
    const guild = channel.guild;

    await channel.permissionOverwrites.edit(ticket.ownerId, { SendMessages: false }).catch(() => null);

    ticket.status = 'closed';
    await ticket.save();

    const transcript = await this.generateTranscript(channel);
    const config = await this.getConfig(guild.id);

    if (config.logChannelId) {
      const logChannel = guild.channels.cache.get(config.logChannelId);
      if (logChannel && transcript) {
        await logChannel
          .send({
            embeds: [
              EmbedManager.build({
                title: `🔒 Ticket #${ticket.number} fermé`,
                fields: [
                  { name: 'Propriétaire', value: `<@${ticket.ownerId}>`, inline: true },
                  { name: 'Fermé par', value: `${closedBy}`, inline: true },
                ],
              }),
            ],
            files: [transcript],
          })
          .catch(() => null);
      }
    }

    const embed = EmbedManager.warning({
      title: '🔒 Ticket fermé',
      description: `Ce ticket a été fermé par ${closedBy}. Utilisez \`+reopen\` pour le rouvrir ou \`+delete\` pour le supprimer définitivement.`,
    });
    await channel.send({ embeds: [embed] }).catch(() => null);

    return transcript;
  }

  static async reopenTicket(channel, ticket) {
    await channel.permissionOverwrites.edit(ticket.ownerId, { SendMessages: true }).catch(() => null);
    ticket.status = 'open';
    await ticket.save();
  }

  static async deleteTicket(channel, ticket) {
    if (ticket.status === 'open') {
      await this.closeTicket(channel, ticket, channel.guild.members.me);
    }
    await Ticket.destroy({ where: { id: ticket.id } });
    await channel.delete('Suppression du ticket.').catch((error) => {
      Logger.error(`Impossible de supprimer le salon de ticket ${channel.id}.`, error);
    });
  }
}

module.exports = TicketService;
