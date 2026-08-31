'use strict';

/**
 * Expressions régulières centralisées utilisées par les systèmes de protection
 * (antilink, antiinvite, antileak, imgmod).
 */
const PATTERNS = {
  URL: /(https?:\/\/[^\s]+)/gi,
  DISCORD_INVITE: /(discord\.gg|discord(?:app)?\.com\/invite)\/[a-zA-Z0-9-]+/gi,
  IPV4: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Numéro de téléphone international/local simplifié (7 à 15 chiffres, séparateurs optionnels)
  PHONE: /\b(?:\+?\d{1,3}[\s.-]?)?(?:\d[\s.-]?){7,13}\d\b/g,
  // Format d'un token de bot Discord (3 segments séparés par des points)
  DISCORD_TOKEN: /[\w-]{24,28}\.[\w-]{6}\.[\w-]{27,40}/g,
};

module.exports = { PATTERNS };
