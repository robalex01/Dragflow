import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useActions } from '../api/queries';
import { ActionModal } from '../components/ActionModal';
import { SkeletonCardGrid } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

const ICONS: Record<string, string> = {
  ban: '🔨',
  kick: '👢',
  warn: '⚠️',
  mute: '🔇',
  unmute: '🔊',
  clear: '🧹',
};

export function ModerationPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const { data: actions, isLoading, isError, refetch } = useActions(guildId);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

  const moderationActions = actions?.filter((a) => a.category === 'moderation') ?? [];
  const activeAction = moderationActions.find((a) => a.key === activeActionKey);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-ink-900">Modération</h1>
      <p className="mt-1 text-sm text-neutral-500">Actions rapides, exécutées directement depuis le dashboard.</p>

      <div className="mt-6">
        {isLoading && <SkeletonCardGrid count={6} />}
        {isError && <ErrorState message="Impossible de récupérer les actions disponibles." onRetry={() => refetch()} />}

        {!isLoading && !isError && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {moderationActions.map((action) => (
              <button
                key={action.key}
                onClick={() => setActiveActionKey(action.key)}
                className="flex flex-col items-center gap-2 rounded-card border border-surface-300 bg-white px-4 py-6 text-center transition hover:border-ink-900 hover:bg-surface-200"
              >
                <span className="text-2xl">{ICONS[action.key] || '⚙️'}</span>
                <span className="text-sm font-medium text-ink-900">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeAction && guildId && (
        <ActionModal guildId={guildId} action={activeAction} onClose={() => setActiveActionKey(null)} />
      )}
    </div>
  );
}
