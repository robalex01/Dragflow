# Dragflow — Bot Discord multifonction (100% préfixe)

Bot Discord modulaire, multi-serveurs, nommé **Dragflow**. **Aucune slash command** : toutes les commandes utilisent un système de préfixe configurable par serveur (`+` par défaut).

> **Statut du projet : PHASE 1 — Architecture.** Cette phase pose les fondations (base de données, chargement des commandes/événements, managers centraux). Les commandes elles-mêmes seront ajoutées phase par phase (voir [Roadmap](#roadmap)).

---

## Sommaire

- [Création du bot Discord](#création-du-bot-discord)
- [Intents et permissions nécessaires](#intents-et-permissions-nécessaires)
- [Installation](#installation)
- [Configuration (.env)](#configuration-env)
- [Base de données](#base-de-données)
- [Démarrage](#démarrage)
- [Architecture du projet](#architecture-du-projet)
- [Ajouter une commande](#ajouter-une-commande)
- [Créer une nouvelle catégorie](#créer-une-nouvelle-catégorie)
- [Système de permissions](#système-de-permissions)
- [Système de logs](#système-de-logs)
- [Dépannage](#dépannage)
- [Roadmap](#roadmap)

---

## Création du bot Discord

1. Rendez-vous sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Cliquez sur **New Application**, donnez-lui un nom.
3. Dans l'onglet **Bot** :
   - Cliquez sur **Reset Token** puis copiez le token → variable `DISCORD_TOKEN`.
   - Activez les **Privileged Gateway Intents** suivants (obligatoires) :
     - `PRESENCE INTENT` (optionnel, pour le statut)
     - `SERVER MEMBERS INTENT` (obligatoire — gestion des membres, auto-role, welcome/leave)
     - `MESSAGE CONTENT INTENT` (**obligatoire** — le bot fonctionne par préfixe et doit lire le contenu des messages)
4. Dans l'onglet **General Information**, copiez l'**Application ID** → variable `CLIENT_ID`.
5. Dans l'onglet **OAuth2 > URL Generator** :
   - Scopes : `bot`
   - Permissions minimales recommandées : `Administrator` (le plus simple pour un bot multifonction), ou à défaut une liste détaillée couvrant modération, gestion des rôles/salons, gestion des messages, gestion des webhooks, connexion/gestion vocale.
6. Utilisez l'URL générée pour inviter le bot sur votre serveur de test.

## Intents et permissions nécessaires

Intents Gateway utilisés dans `src/index.js` :

- `Guilds`
- `GuildMembers` *(privilégié)*
- `GuildMessages`
- `GuildMessageReactions`
- `GuildVoiceStates`
- `GuildInvites`
- `GuildModeration`
- `MessageContent` *(privilégié)*

Permissions Discord recommandées côté serveur : Administrator (ou au minimum : gérer les rôles, gérer les salons, gérer les messages, bannir/expulser des membres, gérer les pseudos, gérer les webhooks, se connecter/gérer les salons vocaux, gérer les emojis).

## Installation

Prérequis :

- Node.js **18.17+** (LTS recommandé)
- PostgreSQL **13+** (recommandé en production) — SQLite est supporté pour un développement local rapide sans serveur de base de données.

```bash
git clone <votre-repo>
cd dragflow
npm install
cp .env.example .env
```

## Configuration (.env)

Remplissez le fichier `.env` à partir de `.env.example` :

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Token du bot (Developer Portal > Bot) |
| `CLIENT_ID` | ID de l'application Discord |
| `DEFAULT_PREFIX` | Préfixe par défaut (`+`) si un serveur n'en a pas configuré |
| `EMBED_COLOR` | Couleur bleue par défaut des embeds (`#3498DB`) |
| `OWNER_IDS` | IDs Discord des propriétaires du bot, séparés par des virgules |
| `DB_DIALECT` | `postgres` (prod) ou `sqlite` (dev local) |
| `DATABASE_URL` | URL complète PostgreSQL (prioritaire sur les champs détaillés) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Connexion PostgreSQL détaillée (si `DATABASE_URL` vide) |
| `SQLITE_STORAGE` | Chemin du fichier SQLite si `DB_DIALECT=sqlite` |
| `ERROR_LOG_CHANNEL_ID` | Salon Discord où les erreurs techniques (stack traces) sont envoyées |
| `SUPPORT_SERVER_INVITE` | Lien d'invitation du serveur de support du bot |

**Ne jamais** committer le fichier `.env` (déjà exclu via `.gitignore`) ni hardcoder de token/clé API dans le code.

## Base de données

### Option A — PostgreSQL (recommandé, production)

```bash
createdb dragflow
# puis renseignez DATABASE_URL ou DB_HOST/DB_NAME/DB_USER/DB_PASSWORD dans .env
DB_DIALECT=postgres
```

### Option B — SQLite (développement local rapide)

```env
DB_DIALECT=sqlite
SQLITE_STORAGE=./data/database.sqlite
```

Dans les deux cas, le schéma (tables) est créé/synchronisé automatiquement au démarrage via Sequelize (`sequelize.sync()`), aucune commande de migration manuelle n'est requise pour cette phase.

Toutes les tables sont isolées par `guildId` : un serveur ne peut jamais lire ou modifier les données d'un autre serveur.

## Démarrage

```bash
# Développement (redémarrage automatique)
npm run dev

# Production
npm start
```

Au démarrage, le bot :

1. Valide la configuration (`.env`).
2. Se connecte à la base de données et synchronise les modèles.
3. Charge automatiquement toutes les commandes (`src/commands/**/*.js`) et tous les événements (`src/events/*.js`).
4. Se connecte à Discord.

## Architecture du projet

```
src/
├── commands/              # Une commande = un fichier, regroupées par catégorie
│   ├── moderation/
│   ├── owner/
│   ├── information/
│   ├── utile/
│   ├── configuration/
│   ├── protection/
│   ├── fun/
│   ├── statistique/
│   ├── ticket/
│   ├── game/
│   ├── giveaway/
│   ├── level/
│   ├── invite/
│   ├── custom/
│   ├── reactionroles/
│   └── greeting/
├── events/                 # Un événement Discord.js = un fichier
├── handlers/               # Chargement automatique commandes/événements
├── managers/                # EmbedManager, PermissionManager, CooldownManager
├── services/                # Logique métier réutilisable (ex: GuildConfigService)
├── database/
│   ├── database.js          # Connexion Sequelize (Postgres/SQLite)
│   └── models/               # Modèles Sequelize (un fichier par table)
├── utils/                    # Logger, ErrorHandler
├── config/                   # Configuration centralisée (.env)
└── index.js                  # Point d'entrée
```

## Ajouter une commande

Créez un fichier dans le sous-dossier de catégorie approprié, par exemple `src/commands/moderation/ban.js` :

```js
module.exports = {
  name: 'ban',
  aliases: ['banir'],
  description: 'Permet de bannir un membre du serveur.',
  usage: '<@membre/id> [raison]',
  examples: ['@Utilisateur spam'],
  permission: 'moderator',        // permission personnalisée par défaut
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  cooldown: 4,
  args: { min: 1 },
  async execute(message, args, { client, prefix }) {
    // logique de la commande
  },
};
```

La commande sera automatiquement détectée et chargée au prochain démarrage (ou rechargement) — aucune inscription manuelle n'est nécessaire.

## Créer une nouvelle catégorie

Créez simplement un nouveau sous-dossier dans `src/commands/` (ex: `src/commands/economie/`) et placez-y vos fichiers de commande. Le nom de la catégorie affiché dans `+help` correspond au nom du dossier, sauf si la commande définit explicitement `category`.

## Système de permissions

Chaque commande déclare une **permission personnalisée** par défaut (`permission: 'moderator'`, etc.) parmi : `everyone`, `membre`, `helper`, `moderator`, `administrator`, `manager`, `owner`, `buyer`, ou toute permission créée via `+newperm`.

Un administrateur de serveur peut réattribuer dynamiquement quelle permission est requise pour une commande via `+setperm`/`+switch`, sans toucher au code. Le `PermissionManager` vérifie, dans l'ordre :

1. Blacklist du serveur
2. Permissions Discord natives requises par la commande (`userPermissions`)
3. Permission personnalisée requise (résolue depuis la base de données)
4. Permissions du bot lui-même (`botPermissions`) pour exécuter l'action

## Système de logs

- Les logs applicatifs (démarrage, commandes exécutées, avertissements) s'affichent dans la console via `Logger`.
- Les erreurs techniques (stack traces) ne sont **jamais** montrées aux utilisateurs ; elles sont envoyées dans le salon Discord défini par `ERROR_LOG_CHANNEL_ID` via `ErrorHandler`.
- Les logs de modération/serveur (bans, kicks, changements de configuration, etc.) seront ajoutés en Phase 3/4 et stockés par `guildId` dans `GuildConfig.logChannels`.

## Dépannage

| Problème | Solution |
|---|---|
| `Configuration invalide. Variables manquantes` | Vérifiez que `.env` contient bien `DISCORD_TOKEN`, `CLIENT_ID` et les infos de base de données. |
| Le bot ne répond à aucune commande | Vérifiez que l'intent `MESSAGE CONTENT INTENT` est activé sur le Developer Portal. |
| `DiscordAPIError` au login | Le token est invalide/expiré — régénérez-le depuis le Developer Portal. |
| Erreur de connexion à la base de données | Vérifiez `DATABASE_URL`/`DB_HOST`/`DB_USER`/`DB_PASSWORD`, ou passez en `DB_DIALECT=sqlite` pour tester en local sans serveur Postgres. |
| Une commande n'apparaît pas | Vérifiez qu'elle exporte bien `name` et `execute`, et qu'elle est placée dans un sous-dossier de `src/commands/`. |

## Roadmap

- [x] **Phase 1** — Architecture
- [x] **Phase 2** — Core (`+help`, `+ping`, `+botinfo`, `+configuration`, `+prefix`, `+perms`)
- [x] **Phase 3** — Modération (38 commandes : ban/kick/mute/warn, rôles, salons, vocal, emojis...)
- [x] **Phase 4** — Protection (antispam, antilink, antiinvite, antialt, raidmode, antileak, badwords, firewall, imgmod, ghostping, secur)
- [x] **Phase 5** — Configuration avancée (autorole, logs, counter, namerole, tagrole, tts, voicemanager, confperms, piconly, invitechannel, linkchannel, protect, confdigi, autoreact, publicserver, recurmsg, sethelp, soutien, suggestion, greeting/joiner/leaver) — ce livrable
- [ ] Phase 3 — Modération
- [ ] Phase 4 — Protection (antispam, antilink, antiraid, ...)
- [ ] Phase 5 — Configuration avancée
- [ ] Phase 6 — Fun + Games
- [ ] Phase 7 — Giveaway + Level + Invites
- [ ] Phase 8 — Tickets
- [ ] Phase 9 — Statistiques
- [ ] Phase 10 — Owner
- [ ] Phase 11 — Tests & audit complet
