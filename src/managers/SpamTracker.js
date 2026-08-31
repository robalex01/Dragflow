'use strict';

/**
 * SpamTracker suit en mémoire les horodatages d'événements par clé
 * (ex: `${guildId}:${userId}`) afin de détecter des rafales d'actions
 * (messages, jointures, actions destructrices...) sans toucher la base de données.
 */
class SpamTracker {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.hits = new Map();
  }

  /**
   * Enregistre un événement pour la clé donnée et retourne le nombre
   * d'événements survenus dans la fenêtre de temps donnée (incluant celui-ci).
   */
  hit(key, windowMs) {
    const now = Date.now();
    const timestamps = (this.hits.get(key) || []).filter((t) => now - t < windowMs);
    timestamps.push(now);
    this.hits.set(key, timestamps);
    return timestamps.length;
  }

  reset(key) {
    this.hits.delete(key);
  }
}

module.exports = {
  spamMessages: new SpamTracker(),
  raidJoins: new SpamTracker(),
  firewallActions: new SpamTracker(),
};
