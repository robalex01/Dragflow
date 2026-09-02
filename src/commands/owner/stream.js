'use strict';

const { ActivityType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');

const DEFAULT_STREAM_URL = 'https://twitch.tv/discord';
const URL_REGEX = /^https?:\/\/\S+$/i;

module.exports = {
  name: 'stream',
  aliases: [],
  category: 'owner',
  description: 'Définit le statut du bot en "En direct" (affecte TOUS les serveurs). Un lien Twitch/YouTube valide est requis par Discord.',
  usage: '<activité> [url]',
  examples: ['une partie explosive', 'une partie explosive https://twitch.tv/monchannel'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const lastArg = args[args.length - 1];
    const hasUrl = URL_REGEX.test(lastArg);
    const url = hasUrl ? lastArg : DEFAULT_STREAM_URL;
    const text = (hasUrl ? args.slice(0, -1) : args).join(' ').substring(0, 128);

    client.user.setActivity(text, { type: ActivityType.Streaming, url });

    const embed = EmbedManager.success({
      title: '🔴 Statut mis à jour',
      description: `Statut : **En direct : ${text}**\nLien : ${url}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
