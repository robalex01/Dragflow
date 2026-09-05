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

export type FieldType = 'member' | 'role' | 'channel' | 'text' | 'number' | 'duration' | 'boolean';

export interface ActionField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  channelType?: 'text' | 'voice';
}

export interface DashboardAction {
  key: string;
  label: string;
  category: string;
  dangerous: boolean;
  fields: ActionField[];
}

export interface GuildMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bot: boolean;
}

export interface GuildRole {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface GuildChannel {
  id: string;
  name: string;
  type: number;
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
