'use strict';

const { validateDashboardConfig } = require('../config/config');
const { startWebServer } = require('../web/server');
const Logger = require('../utils/Logger');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    const check = validateDashboardConfig();

    if (check.disabled) {
      Logger.info('Dashboard désactivé (DASHBOARD_ENABLED=false).');
      return;
    }

    if (!check.ok) {
      Logger.warn(
        `Dashboard non démarré : variables manquantes dans .env (${check.missing.join(', ')}). Le bot continue de fonctionner normalement sans dashboard.`
      );
      return;
    }

    try {
      await startWebServer(client);
    } catch (error) {
      Logger.error("Le dashboard n'a pas pu démarrer, mais le bot continue de fonctionner normalement.", error);
    }
  },
};
