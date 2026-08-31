'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { paginate } = require('../../managers/PaginationManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveUser } = require('../../utils/resolveUser');
const InfractionService = require('../../services/InfractionService');

const TYPE_LABELS = {
  ban: '🔨 Ban',
  tempban: '⏳ Ban temporaire',
  unban: '✅ Unban',
  kick: '👢 Kick',
  warn: '⚠️ Warn',
  mute: '🔇 Mute',
  unmute: '🔊 Unmute',
};

const PER_PAGE = 8;

module.exports = {
  name: 'infractions',
  aliases: ['casier', 'modlogs'],
  category: 'moderation',
  description: "Affiche l'historique des sanctions d'un membre.",
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'helper',
  cooldown: 4,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const target =
      (await resolveMember(message.guild, args[0])) || (await resolveUser(client, args[0]));

    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const user = target.user || target;
    const history = await InfractionService.getHistory(message.guild.id, user.id);

    if (history.length === 0) {
      const embed = EmbedManager.build({
        title: `📋 Casier de ${user.tag}`,
        description: "Ce membre n'a aucune sanction enregistrée.",
      });
      return message.channel.send({ embeds: [embed] });
    }

    const pages = [];
    for (let i = 0; i < history.length; i += PER_PAGE) {
      const slice = history.slice(i, i + PER_PAGE);
      const description = slice
        .map(
          (inf) =>
            `**#${inf.caseNumber} — ${TYPE_LABELS[inf.type] || inf.type}**${
              inf.active === false ? ' *(retiré)*' : ''
            }\n<t:${Math.floor(new Date(inf.createdAt).getTime() / 1000)}:R> — Par <@${inf.moderatorId}>\n${inf.reason}`
        )
        .join('\n\n');

      pages.push(
        EmbedManager.build({
          title: `📋 Casier de ${user.tag}`,
          description,
          client,
          footerText: `Page ${pages.length + 1}/${Math.ceil(history.length / PER_PAGE)} • ${history.length} sanction(s)`,
          timestamp: true,
        })
      );
    }

    await paginate(message, pages);
  },
};
