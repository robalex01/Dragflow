'use strict';

const { BotSettings } = require('../database/models');

/**
 * Cache mémoire des réglages globaux du bot (+footer, +theme), lu de façon
 * synchrone par EmbedManager. Chargé une fois au démarrage puis mis à jour
 * directement par les commandes concernées (qui persistent aussi en DB).
 */
const state = {
  footerText: null,
  embedColor: null,
};

async function load() {
  const [settings] = await BotSettings.findOrCreate({ where: { id: 1 } });
  state.footerText = settings.footerText;
  state.embedColor = settings.embedColor;
  return settings;
}

function get() {
  return state;
}

async function setFooter(text) {
  const [settings] = await BotSettings.findOrCreate({ where: { id: 1 } });
  settings.footerText = text;
  await settings.save();
  state.footerText = text;
}

async function setEmbedColor(color) {
  const [settings] = await BotSettings.findOrCreate({ where: { id: 1 } });
  settings.embedColor = color;
  await settings.save();
  state.embedColor = color;
}

module.exports = { load, get, setFooter, setEmbedColor };
