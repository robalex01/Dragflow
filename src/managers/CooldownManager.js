'use strict';

/**
 * CooldownManager gère les cooldowns en mémoire, par commande et par utilisateur.
 * Structure interne : Map<commandName, Map<userId, expirationTimestamp>>
 */
class CooldownManager {
  constructor() {
    /** @type {Map<string, Map<string, number>>} */
    this.cooldowns = new Map();
  }

  /**
   * Vérifie si un utilisateur peut exécuter une commande.
   * @returns {{ onCooldown: boolean, remainingMs?: number }}
   */
  check(commandName, userId, cooldownSeconds) {
    if (!cooldownSeconds || cooldownSeconds <= 0) {
      return { onCooldown: false };
    }

    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }

    const timestamps = this.cooldowns.get(commandName);
    const now = Date.now();
    const expiresAt = timestamps.get(userId);

    if (expiresAt && now < expiresAt) {
      return { onCooldown: true, remainingMs: expiresAt - now };
    }

    timestamps.set(userId, now + cooldownSeconds * 1000);

    // Nettoyage automatique après expiration pour éviter une fuite mémoire.
    setTimeout(() => {
      const map = this.cooldowns.get(commandName);
      if (map) map.delete(userId);
    }, cooldownSeconds * 1000).unref();

    return { onCooldown: false };
  }

  /**
   * Formate un temps restant en millisecondes en texte lisible (fr).
   */
  static formatRemaining(ms) {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes} minute${minutes > 1 ? 's' : ''}${rest > 0 ? ` ${rest}s` : ''}`;
  }

  /** Réinitialise le cooldown d'un utilisateur pour une commande (ex: en cas d'erreur avant exécution réelle) */
  reset(commandName, userId) {
    const map = this.cooldowns.get(commandName);
    if (map) map.delete(userId);
  }
}

module.exports = new CooldownManager();
