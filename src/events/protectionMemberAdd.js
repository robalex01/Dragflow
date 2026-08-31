'use strict';

const EmbedManager = require('../managers/EmbedManager');
const ModLogService = require('../services/ModLogService');
const ProtectionService = require('../services/ProtectionService');
const { raidJoins } = require('../managers/SpamTracker');

const ALT_MIN_ACCOUNT_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const RAID_WINDOW_MS = 10 * 1000;
const RAID_JOIN_THRESHOLD = 5;

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    const settings = await ProtectionService.getSettings(member.guild.id);

    // Mode raid : si activé, tout nouveau membre est expulsé pendant la durée d'activation.
    if (settings.raidmode) {
      await member
        .send({
          embeds: [
            EmbedManager.warning({
              title: '🛡️ Mode raid actif',
              description: `Le serveur **${member.guild.name}** est actuellement en mode raid. Merci de réessayer de rejoindre plus tard.`,
            }),
          ],
        })
        .catch(() => null);
      await member.kick('Mode raid actif.').catch(() => null);

      await ModLogService.send(member.guild, {
        title: '🛡️ Mode raid — membre expulsé',
        fields: [{ name: 'Membre', value: `${member.user.tag} (${member.id})` }],
      });
      return;
    }

    // Anti-alt : expulse les comptes trop récents.
    if (settings.antialt) {
      const accountAge = Date.now() - member.user.createdTimestamp;
      if (accountAge < ALT_MIN_ACCOUNT_AGE_MS) {
        await member
          .send({
            embeds: [
              EmbedManager.warning({
                title: '🛡️ Compte trop récent',
                description: `Votre compte Discord est trop récent pour rejoindre **${member.guild.name}**.`,
              }),
            ],
          })
          .catch(() => null);
        await member.kick('AntiAlt : compte trop récent.').catch(() => null);

        await ModLogService.send(member.guild, {
          title: '🛡️ AntiAlt — membre expulsé',
          fields: [
            { name: 'Membre', value: `${member.user.tag} (${member.id})` },
            { name: "Âge du compte", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
          ],
        });
        return;
      }
    }

    // Détection de raid automatique : rafale de joins en peu de temps → active le mode raid.
    const joinCount = raidJoins.hit(member.guild.id, RAID_WINDOW_MS);
    if (joinCount >= RAID_JOIN_THRESHOLD && !settings.raidmode) {
      await ProtectionService.setEnabled(member.guild.id, 'raidmode', true);
      await ModLogService.send(member.guild, {
        title: '🚨 Raid détecté automatiquement',
        color: '#E74C3C',
        fields: [
          {
            name: 'Action',
            value: `Mode raid activé automatiquement (${joinCount} arrivées en ${RAID_WINDOW_MS / 1000}s). Utilisez \`+raidmode off\` pour le désactiver.`,
          },
        ],
      });
    }
  },
};
