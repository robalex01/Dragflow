export interface DashboardUser {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string;
}

export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
  owner: boolean;
  manageable: boolean;
  botPresent: boolean;
  memberCount: number | null;
}

export interface GuildDetail {
  id: string;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  onlineBot: boolean;
  prefix: string;
  embedColor: string;
  totalMessagesTracked: number;
  uptimeMs: number;
  permissions: { administrator: boolean; manageGuild: boolean };
}

export interface CommandArgs {
  min?: number;
}

export interface Command {
  name: string;
  aliases: string[];
  category: string;
  description: string | null;
  usage: string;
  examples: string[];
  permission: string;
  userPermissions: string[];
  botPermissions: string[];
  ownerOnly: boolean;
  cooldown: number;
  args: CommandArgs | null;
}

export interface ApiError {
  error: string;
  message: string;
}
