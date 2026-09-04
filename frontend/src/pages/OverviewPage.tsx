import { useParams, Link } from 'react-router-dom';
import { useGuildDetail } from '../api/queries';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { Avatar } from '../components/Avatar';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-surface-300 bg-white p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function OverviewPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const { data: guild, isLoading, isError, refetch } = useGuildDetail(guildId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      )}

      {isError && <ErrorState message="Impossible de récupérer les informations du serveur." onRetry={() => refetch()} />}

      {guild && (
        <>
          <div className="flex items-center gap-3">
            <Avatar src={guild.iconUrl} alt={guild.name} size={48} />
            <div>
              <h1 className="text-xl font-semibold text-ink-900">Bonjour 👋</h1>
              <p className="text-sm text-neutral-500">Voici l'état de {guild.name}.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Dragflow" value="● En ligne" />
            <StatCard label="Membres" value={guild.memberCount.toLocaleString('fr-FR')} />
            <StatCard label="Préfixe" value={guild.prefix} />
            <StatCard label="Uptime du bot" value={formatUptime(guild.uptimeMs)} />
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-medium text-ink-900">Accès rapides</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/servers/${guildId}/commands`}
                className="rounded-card border border-surface-300 bg-white px-4 py-2 text-sm text-ink-900 transition hover:bg-surface-200"
              >
                Voir les commandes
              </Link>
              <Link
                to={`/servers/${guildId}/category/moderation`}
                className="rounded-card border border-surface-300 bg-white px-4 py-2 text-sm text-ink-900 transition hover:bg-surface-200"
              >
                Modération
              </Link>
              <Link
                to={`/servers/${guildId}/category/protection`}
                className="rounded-card border border-surface-300 bg-white px-4 py-2 text-sm text-ink-900 transition hover:bg-surface-200"
              >
                Protection
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
