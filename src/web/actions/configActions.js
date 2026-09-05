'use strict';

const GuildConfigService = require('../../services/GuildConfigService');

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const MAX_PREFIX_LENGTH = 5;

const setPrefix = {
  key: 'set-prefix',
  label: 'Changer le préfixe',
  category: 'configuration',
  dangerous: false,
  fields: [{ key: 'prefix', label: 'Nouveau préfixe', type: 'text', required: true, placeholder: '+' }],
  async execute({ guild }, params) {
    const prefix = (params.prefix || '').trim();
    if (!prefix) return { ok: false, message: 'Le préfixe ne peut pas être vide.' };
    if (prefix.length > MAX_PREFIX_LENGTH) return { ok: false, message: `Le préfixe ne peut pas dépasser ${MAX_PREFIX_LENGTH} caractères.` };
    if (/\s/.test(prefix)) return { ok: false, message: "Le préfixe ne peut pas contenir d'espace." };

    await GuildConfigService.setPrefix(guild.id, prefix);
    return { ok: true, message: `Le préfixe est maintenant "${prefix}".` };
  },
};

const setEmbedColor = {
  key: 'set-embed-color',
  label: 'Changer la couleur des embeds',
  category: 'configuration',
  dangerous: false,
  fields: [{ key: 'color', label: 'Couleur (hex)', type: 'text', required: true, placeholder: '#3498DB' }],
  async execute({ guild }, params) {
    const color = (params.color || '').trim();
    if (!HEX_REGEX.test(color)) return { ok: false, message: 'Couleur invalide (format attendu : #RRGGBB).' };

    await GuildConfigService.update(guild.id, { embedColor: color });
    return { ok: true, message: `La couleur des embeds est maintenant ${color}.` };
  },
};

module.exports = [setPrefix, setEmbedColor];
