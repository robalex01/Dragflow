'use strict';

const { ChannelType, PermissionsBitField } = require('discord.js');
const GuildConfigService = require('../services/GuildConfigService');
const { VoiceTempChannel } = require('../database/models');
const Logger = require('../utils/Logger');

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState) {
    const guild = newState.guild || oldState.guild;
    const guildConfig = await GuildConfigService.getOrCreate(guild.id);

    // Un membre rejoint le salon "hub" configuré : on lui crée un salon temporaire.
    if (
      guildConfig.voiceManagerChannelId &&
      newState.channelId === guildConfig.voiceManagerChannelId &&
      oldState.channelId !== guildConfig.voiceManagerChannelId
    ) {
      try {
        const hub = guild.channels.cache.get(guildConfig.voiceManagerChannelId);
        const created = await guild.channels.create({
          name: `🔊 Salon de ${newState.member.displayName}`,
          type: ChannelType.GuildVoice,
          parent: hub?.parentId || null,
          permissionOverwrites: [
            {
              id: newState.id,
              allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers],
            },
          ],
        });

        await VoiceTempChannel.create({ guildId: guild.id, channelId: created.id, ownerId: newState.id });
        await newState.setChannel(created).catch(() => null);
      } catch (error) {
        Logger.error("Impossible de créer un salon vocal temporaire.", error);
      }
    }

    // Un salon vocal temporaire devient vide : on le supprime.
    if (oldState.channelId) {
      const tempChannel = await VoiceTempChannel.findOne({ where: { channelId: oldState.channelId } });
      if (tempChannel) {
        const channel = guild.channels.cache.get(oldState.channelId);
        if (channel && channel.members.size === 0) {
          await channel.delete('Salon vocal temporaire vide.').catch(() => null);
          await tempChannel.destroy();
        }
      }
    }
  },
};
