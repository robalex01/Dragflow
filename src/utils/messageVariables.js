'use strict';

/**
 * Remplace les variables `{user}`, `{username}`, `{userid}`, `{server}`,
 * `{serverid}`, `{membercount}` dans un texte, pour les messages de bienvenue/
 * départ et les commandes personnalisées.
 */
function applyVariables(template, { member, guild }) {
  if (!template) return template;

  return template
    .replace(/\{user\}/g, member ? `${member}` : '')
    .replace(/\{username\}/g, member ? member.user.username : '')
    .replace(/\{userid\}/g, member ? member.id : '')
    .replace(/\{server\}/g, guild ? guild.name : '')
    .replace(/\{serverid\}/g, guild ? guild.id : '')
    .replace(/\{membercount\}/g, guild ? `${guild.memberCount}` : '');
}

module.exports = { applyVariables };
