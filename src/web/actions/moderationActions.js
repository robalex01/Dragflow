'use strict';

const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const { parseDuration, formatDuration, MAX_TIMEOUT_MS } = require('../../utils/parseDuration');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

/**
 * Construit le même objet minimal que checkHierarchy() attend d'un message
 * Discord.js réel — sans fabriquer un faux Message complet (fragile, risqué
 * pour 173 commandes). checkHierarchy ne lit que guild/member/client.user.id,
 * tous fournis ici avec de VRAIS objets discord.js.
 */
function buildHierarchyContext(guild, executorMember, client) {
  return { guild, member: executorMember, client: { user: { id: client.user.id } } };
}

const ACTOR_LABEL = (executorMember) => `Dashboard : ${executorMember.user.tag}`;

const banMember = {
  key: 'ban',
  label: 'Bannir un membre',
  category: 'moderation',
  dangerous: true,
  confirmMessage: (params) => `Cette action va bannir définitivement ce membre du serveur.`,
  fields: [
    { key: 'memberId', label: 'Membre', type: 'member', required: true },
    { key: 'reason', label: 'Raison', type: 'text', required: false, placeholder: 'Aucune raison fournie.' },
  ],
  async execute({ guild, executorMember, client }, params) {
    const target = await guild.members.fetch(params.memberId).catch(() => null);
    if (!target) return { ok: false, message: 'Membre introuvable.' };

    const hierarchy = await checkHierarchy(buildHierarchyContext(guild, executorMember, client), target);
    if (!hierarchy.ok) return { ok: false, message: hierarchyErrorMessage(hierarchy.reason) };

    const reason = params.reason || 'Aucune raison fournie.';
    await target.ban({ reason: `${ACTOR_LABEL(executorMember)} : ${reason}` });

    await InfractionService.create({ guildId: guild.id, userId: target.id, moderatorId: executorMember.id, type: 'ban', reason });
    await ModLogService.send(guild, {
      title: '🔨 Membre banni (via dashboard)',
      color: '#E74C3C',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: ACTOR_LABEL(executorMember), inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    return { ok: true, message: `${target.user.tag} a été banni.` };
  },
};

const kickMember = {
  key: 'kick',
  label: 'Expulser un membre',
  category: 'moderation',
  dangerous: true,
  confirmMessage: () => 'Cette action va expulser ce membre du serveur (il pourra revenir avec une invitation).',
  fields: [
    { key: 'memberId', label: 'Membre', type: 'member', required: true },
    { key: 'reason', label: 'Raison', type: 'text', required: false, placeholder: 'Aucune raison fournie.' },
  ],
  async execute({ guild, executorMember, client }, params) {
    const target = await guild.members.fetch(params.memberId).catch(() => null);
    if (!target) return { ok: false, message: 'Membre introuvable.' };

    const hierarchy = await checkHierarchy(buildHierarchyContext(guild, executorMember, client), target);
    if (!hierarchy.ok) return { ok: false, message: hierarchyErrorMessage(hierarchy.reason) };

    const reason = params.reason || 'Aucune raison fournie.';
    await target.kick(`${ACTOR_LABEL(executorMember)} : ${reason}`);

    await InfractionService.create({ guildId: guild.id, userId: target.id, moderatorId: executorMember.id, type: 'kick', reason });
    await ModLogService.send(guild, {
      title: '👢 Membre expulsé (via dashboard)',
      color: '#E67E22',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: ACTOR_LABEL(executorMember), inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    return { ok: true, message: `${target.user.tag} a été expulsé.` };
  },
};

const warnMember = {
  key: 'warn',
  label: 'Avertir un membre',
  category: 'moderation',
  dangerous: false,
  fields: [
    { key: 'memberId', label: 'Membre', type: 'member', required: true },
    { key: 'reason', label: 'Raison', type: 'text', required: false, placeholder: 'Aucune raison fournie.' },
  ],
  async execute({ guild, executorMember, client }, params) {
    const target = await guild.members.fetch(params.memberId).catch(() => null);
    if (!target) return { ok: false, message: 'Membre introuvable.' };

    const hierarchy = await checkHierarchy(buildHierarchyContext(guild, executorMember, client), target);
    if (!hierarchy.ok) return { ok: false, message: hierarchyErrorMessage(hierarchy.reason) };

    const reason = params.reason || 'Aucune raison fournie.';
    const infraction = await InfractionService.create({ guildId: guild.id, userId: target.id, moderatorId: executorMember.id, type: 'warn', reason });

    await ModLogService.send(guild, {
      title: '⚠️ Membre averti (via dashboard)',
      color: '#F1C40F',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: ACTOR_LABEL(executorMember), inline: true },
        { name: 'Cas #', value: `${infraction.caseNumber}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    return { ok: true, message: `${target.user.tag} a reçu l'avertissement #${infraction.caseNumber}.` };
  },
};

const muteMember = {
  key: 'mute',
  label: 'Rendre muet un membre',
  category: 'moderation',
  dangerous: false,
  fields: [
    { key: 'memberId', label: 'Membre', type: 'member', required: true },
    { key: 'duration', label: 'Durée', type: 'duration', required: true, placeholder: '10m, 1h, 1d...' },
    { key: 'reason', label: 'Raison', type: 'text', required: false, placeholder: 'Aucune raison fournie.' },
  ],
  async execute({ guild, executorMember, client }, params) {
    const target = await guild.members.fetch(params.memberId).catch(() => null);
    if (!target) return { ok: false, message: 'Membre introuvable.' };

    let durationMs = parseDuration(params.duration);
    if (!durationMs) return { ok: false, message: 'Durée invalide (exemple : 10m, 1h, 1d).' };
    if (durationMs > MAX_TIMEOUT_MS) durationMs = MAX_TIMEOUT_MS;

    const hierarchy = await checkHierarchy(buildHierarchyContext(guild, executorMember, client), target);
    if (!hierarchy.ok) return { ok: false, message: hierarchyErrorMessage(hierarchy.reason) };

    const reason = params.reason || 'Aucune raison fournie.';
    await target.timeout(durationMs, `${ACTOR_LABEL(executorMember)} : ${reason}`);

    await InfractionService.create({
      guildId: guild.id,
      userId: target.id,
      moderatorId: executorMember.id,
      type: 'mute',
      reason: `${reason} (durée : ${formatDuration(durationMs)})`,
    });
    await ModLogService.send(guild, {
      title: '🔇 Membre rendu muet (via dashboard)',
      color: '#95A5A6',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: formatDuration(durationMs), inline: true },
        { name: 'Modérateur', value: ACTOR_LABEL(executorMember), inline: true },
      ],
    });

    return { ok: true, message: `${target.user.tag} est muet pendant ${formatDuration(durationMs)}.` };
  },
};

const unmuteMember = {
  key: 'unmute',
  label: 'Retirer le mute',
  category: 'moderation',
  dangerous: false,
  fields: [{ key: 'memberId', label: 'Membre', type: 'member', required: true }],
  async execute({ guild, executorMember }, params) {
    const target = await guild.members.fetch(params.memberId).catch(() => null);
    if (!target) return { ok: false, message: 'Membre introuvable.' };
    if (!target.isCommunicationDisabled()) return { ok: false, message: "Ce membre n'est pas muet." };

    await target.timeout(null, `${ACTOR_LABEL(executorMember)} : retrait du mute.`);
    await InfractionService.create({ guildId: guild.id, userId: target.id, moderatorId: executorMember.id, type: 'unmute', reason: 'Retrait manuel (dashboard).' });
    await ModLogService.send(guild, {
      title: '🔊 Mute retiré (via dashboard)',
      color: '#2ECC71',
      fields: [
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: ACTOR_LABEL(executorMember), inline: true },
      ],
    });

    return { ok: true, message: `Le mute de ${target.user.tag} a été retiré.` };
  },
};

const clearMessages = {
  key: 'clear',
  label: 'Supprimer des messages',
  category: 'moderation',
  dangerous: true,
  confirmMessage: (params) => `Ceci va supprimer définitivement jusqu'à ${params.amount} message(s).`,
  fields: [
    { key: 'channelId', label: 'Salon', type: 'channel', channelType: 'text', required: true },
    { key: 'amount', label: 'Nombre de messages', type: 'number', required: true, min: 1, max: 100 },
    { key: 'memberId', label: 'Filtrer par membre (optionnel)', type: 'member', required: false },
  ],
  async execute({ guild, executorMember }, params) {
    const channel = guild.channels.cache.get(params.channelId);
    if (!channel || !channel.isTextBased()) return { ok: false, message: 'Salon introuvable.' };

    const amount = Math.min(Math.max(Number(params.amount) || 0, 1), 100);
    const fetched = await channel.messages.fetch({ limit: 100 });
    const now = Date.now();
    let toDelete = fetched.filter((m) => now - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
    if (params.memberId) toDelete = toDelete.filter((m) => m.author.id === params.memberId);
    const targets = [...toDelete.values()].slice(0, amount);

    if (targets.length === 0) return { ok: false, message: 'Aucun message à supprimer trouvé.' };

    const deleted = await channel.bulkDelete(targets, true);
    await ModLogService.send(guild, {
      title: '🧹 Messages supprimés (via dashboard)',
      fields: [
        { name: 'Salon', value: `${channel}`, inline: true },
        { name: 'Quantité', value: `${deleted.size}`, inline: true },
        { name: 'Modérateur', value: ACTOR_LABEL(executorMember), inline: true },
      ],
    });

    return { ok: true, message: `${deleted.size} message(s) supprimé(s).` };
  },
};

module.exports = [banMember, kickMember, warnMember, muteMember, unmuteMember, clearMessages];
