'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { paginate } = require('../../managers/PaginationManager');

const PER_PAGE = 10;

module.exports = {
  name: 'serverlist',
  aliases: ['guilds'],
  category: 'owner',
  description: 'Liste tous les serveurs sur lesquels le bot est présent.',
  usage: '',
  examples: [''],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args, { client }) {
    const guilds = [...client.guilds.cache.values()];

    const pages = [];
    for (let i = 0; i < guilds.length; i += PER_PAGE) {
      const slice = guilds.slice(i, i + PER_PAGE);
      pages.push(
        EmbedManager.build({
          title: `🌐 Serveurs (${guilds.length})`,
          description: slice.map((g) => `**${g.name}** — ${g.memberCount} membres (\`${g.id}\`)`).join('\n'),
          footerText: `Page ${pages.length + 1}/${Math.ceil(guilds.length / PER_PAGE)}`,
        })
      );
    }

    await paginate(message, pages);
  },
};
