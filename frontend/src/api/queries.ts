import { useQuery } from '@tanstack/react-query';
import { apiRequest, ApiRequestError } from './client';
import type { DashboardUser, Guild, GuildDetail, Command } from '../types';

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
