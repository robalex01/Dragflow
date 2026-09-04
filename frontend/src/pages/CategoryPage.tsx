import { useParams } from 'react-router-dom';
import { useCommands, useCategories } from '../api/queries';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SkeletonCardGrid } from '../components/Skeleton';

export function CategoryPage() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const { data: commands, isLoading, isError, refetch } = useCommands(true);
  const { data: categories } = useCategories(true);

  const category = categories?.find((c) => c.key === categoryKey);
  const filtered = commands?.filter((c) => c.category === categoryKey) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-ink-900">{category?.label || categoryKey}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Cette catégorie ne dispose pas encore d'une interface de configuration dédiée — les
        commandes listées ci-dessous sont utilisables depuis Discord dès maintenant.
      </p>

      <div className="mt-6">
        {isLoading && <SkeletonCardGrid count={4} />}
        {isError && <ErrorState message="Impossible de récupérer les commandes." onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState title="Aucune commande dans cette catégorie" />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((cmd) => (
              <div key={cmd.name} className="rounded-card border border-surface-300 bg-white p-4">
                <p className="font-mono text-sm font-medium text-ink-900">+{cmd.name}</p>
                {cmd.description && <p className="mt-1 text-sm text-neutral-500">{cmd.description}</p>}
                <p className="mt-2 font-mono text-xs text-neutral-400">
                  +{cmd.name} {cmd.usage}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
