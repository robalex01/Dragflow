import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCommands, useCategories } from '../api/queries';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import type { Command } from '../types';

function CommandCard({ command }: { command: Command }) {
  return (
    <div className="rounded-card border border-surface-300 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-medium text-ink-900">+{command.name}</p>
        <span className="rounded-card bg-surface-200 px-2 py-0.5 text-xs text-neutral-600">
          {command.permission}
        </span>
      </div>
      {command.description && <p className="mt-1 text-sm text-neutral-500">{command.description}</p>}
      <p className="mt-2 font-mono text-xs text-neutral-400">
        +{command.name} {command.usage}
      </p>
      {command.aliases.length > 0 && (
        <p className="mt-1 text-xs text-neutral-400">Alias : {command.aliases.map((a) => `+${a}`).join(', ')}</p>
      )}
      {command.cooldown > 0 && (
        <p className="mt-1 text-xs text-neutral-400">Cooldown : {command.cooldown}s</p>
      )}
    </div>
  );
}

export function CommandsPage() {
  useParams<{ guildId: string }>();
  const { data: commands, isLoading, isError, refetch } = useCommands(true);
  const { data: categories } = useCategories(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!commands) return [];
    return commands
      .filter((c) => activeCategory === 'all' || c.category === activeCategory)
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
  }, [commands, activeCategory, search]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-ink-900">Commandes</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Liste complète des commandes disponibles sur Dragflow ({commands?.length ?? '…'} au total).
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher une commande"
          className="w-full rounded-card border border-surface-300 bg-white px-4 py-2 text-sm outline-none focus:border-ink-900 sm:max-w-xs"
        />
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="rounded-card border border-surface-300 bg-white px-3 py-2 text-sm text-ink-900"
        >
          <option value="all">Toutes les catégories</option>
          {categories?.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}

        {isError && <ErrorState message="Impossible de récupérer les commandes." onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState title="Aucune commande trouvée" description="Essayez une autre recherche ou catégorie." />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((cmd) => (
              <CommandCard key={cmd.name} command={cmd} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
