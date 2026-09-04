import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuilds } from '../api/queries';
import { SkeletonCardGrid } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Avatar } from '../components/Avatar';
import type { Guild } from '../types';

type Filter = 'all' | 'installed' | 'missing';

function GuildCard({ guild }: { guild: Guild }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 rounded-card border border-surface-300 bg-white p-4">
      <Avatar src={guild.iconUrl} alt={guild.name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{guild.name}</p>
        <p className="text-xs text-neutral-500">
          {guild.botPresent
            ? `Dragflow installé${guild.memberCount !== null ? ` · ${guild.memberCount} membres` : ''}`
            : 'Dragflow absent'}
        </p>
      </div>
      {guild.botPresent ? (
        <button
          disabled={!guild.manageable}
          onClick={() => navigate(`/servers/${guild.id}`)}
          title={!guild.manageable ? "Vous n'avez pas les permissions nécessaires." : undefined}
          className="shrink-0 rounded-card bg-ink-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-surface-300 disabled:text-neutral-400"
        >
          Gérer
        </button>
      ) : (
        <a
          href={`https://discord.com/oauth2/authorize?client_id=${guild.id}&scope=bot&permissions=8`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-card border border-surface-300 px-3 py-2 text-xs font-medium text-ink-900 transition hover:bg-surface-200"
        >
          Ajouter Dragflow
        </a>
      )}
    </div>
  );
}

export function ServersPage() {
  const { data: guilds, isLoading, isError, refetch } = useGuilds(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (!guilds) return [];
    return guilds
      .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
      .filter((g) => {
        if (filter === 'installed') return g.botPresent;
        if (filter === 'missing') return !g.botPresent;
        return true;
      });
  }, [guilds, search, filter]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold text-ink-900">Mes serveurs</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un serveur"
          className="w-full rounded-card border border-surface-300 bg-white px-4 py-2 text-sm outline-none focus:border-ink-900 sm:max-w-xs"
        />
        <div className="flex gap-2 text-xs">
          {(['all', 'installed', 'missing'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-card px-3 py-2 font-medium transition ${
                filter === f ? 'bg-ink-900 text-white' : 'border border-surface-300 text-ink-900 hover:bg-surface-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'installed' ? 'Dragflow installé' : 'Dragflow absent'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {isLoading && <SkeletonCardGrid count={4} />}

        {isError && <ErrorState message="Impossible de récupérer vos serveurs." onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            title="Aucun serveur trouvé"
            description={
              guilds?.length === 0
                ? "Vous n'avez accès à aucun serveur Discord."
                : 'Aucun serveur ne correspond à votre recherche.'
            }
          />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((g) => (
              <GuildCard key={g.id} guild={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
