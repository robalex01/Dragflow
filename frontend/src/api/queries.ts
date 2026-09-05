import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, ApiRequestError } from './client';
import type { DashboardUser, Guild, GuildDetail, Command, DashboardAction, GuildMember, GuildRole, GuildChannel } from '../types';

export interface Category {
  key: string;
  label: string;
  commandCount: number;
}

/**
 * Utilisateur courant. `retry: false` + gestion explicite du 401 : on ne
 * veut pas marteler l'API si la personne n'est simplement pas connectée.
 */
export function useCurrentUser() {
  return useQuery<DashboardUser, ApiRequestError>({
    queryKey: ['user'],
    queryFn: () => apiRequest<DashboardUser>('/api/user'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGuilds(enabled: boolean) {
  return useQuery<Guild[], ApiRequestError>({
    queryKey: ['guilds'],
    queryFn: async () => (await apiRequest<{ guilds: Guild[] }>('/api/guilds')).guilds,
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useGuildDetail(guildId: string | undefined) {
  return useQuery<GuildDetail, ApiRequestError>({
    queryKey: ['guild', guildId],
    queryFn: () => apiRequest<GuildDetail>(`/api/guilds/${guildId}`),
    enabled: Boolean(guildId),
    staleTime: 30 * 1000,
  });
}

export function useCommands(enabled: boolean) {
  return useQuery<Command[], ApiRequestError>({
    queryKey: ['commands'],
    queryFn: async () => (await apiRequest<{ commands: Command[] }>('/api/commands')).commands,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories(enabled: boolean) {
  return useQuery<Category[], ApiRequestError>({
    queryKey: ['categories'],
    queryFn: async () => (await apiRequest<{ categories: Category[] }>('/api/categories')).categories,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActions(guildId: string | undefined) {
  return useQuery<DashboardAction[], ApiRequestError>({
    queryKey: ['actions', guildId],
    queryFn: async () => (await apiRequest<{ actions: DashboardAction[] }>(`/api/guilds/${guildId}/actions`)).actions,
    enabled: Boolean(guildId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRunAction(guildId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, ApiRequestError, { actionKey: string; params: Record<string, unknown> }>({
    mutationFn: ({ actionKey, params }) =>
      apiRequest(`/api/guilds/${guildId}/actions/${actionKey}`, { method: 'POST', body: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId] });
    },
  });
}

export function useGuildMembers(guildId: string | undefined, search: string) {
  return useQuery<GuildMember[], ApiRequestError>({
    queryKey: ['members', guildId, search],
    queryFn: async () =>
      (
        await apiRequest<{ members: GuildMember[] }>(
          `/api/guilds/${guildId}/members?search=${encodeURIComponent(search)}`
        )
      ).members,
    enabled: Boolean(guildId),
    staleTime: 30 * 1000,
  });
}

export function useGuildRoles(guildId: string | undefined) {
  return useQuery<GuildRole[], ApiRequestError>({
    queryKey: ['roles', guildId],
    queryFn: async () => (await apiRequest<{ roles: GuildRole[] }>(`/api/guilds/${guildId}/roles`)).roles,
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });
}

export function useGuildChannels(guildId: string | undefined, type?: 'text' | 'voice') {
  return useQuery<GuildChannel[], ApiRequestError>({
    queryKey: ['channels', guildId, type],
    queryFn: async () =>
      (
        await apiRequest<{ channels: GuildChannel[] }>(
          `/api/guilds/${guildId}/channels${type ? `?type=${type}` : ''}`
        )
      ).channels,
    enabled: Boolean(guildId),
    staleTime: 60 * 1000,
  });
}
