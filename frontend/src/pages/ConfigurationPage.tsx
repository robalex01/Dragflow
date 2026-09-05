import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGuildDetail, useRunAction } from '../api/queries';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/Skeleton';

export function ConfigurationPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const { data: guild, isLoading, refetch } = useGuildDetail(guildId);
  const runAction = useRunAction(guildId);
  const { showToast } = useToast();

  const [prefix, setPrefix] = useState('');
  const [color, setColor] = useState('');

  const currentPrefix = prefix || guild?.prefix || '';
  const currentColor = color || guild?.embedColor || '#3498DB';

  const handleSavePrefix = () => {
    runAction.mutate(
      { actionKey: 'set-prefix', params: { prefix: currentPrefix } },
      {
        onSuccess: (data) => {
          showToast(data.message, 'success');
          refetch();
        },
        onError: (err) => showToast(err.message, 'error'),
      }
    );
  };

  const handleSaveColor = () => {
    runAction.mutate(
      { actionKey: 'set-embed-color', params: { color: currentColor } },
      {
        onSuccess: (data) => {
          showToast(data.message, 'success');
          refetch();
        },
        onError: (err) => showToast(err.message, 'error'),
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-ink-900">Configuration</h1>
      <p className="mt-1 text-sm text-neutral-500">Réglages généraux du serveur.</p>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-card border border-surface-300 bg-white p-4">
            <label className="mb-1 block text-xs font-medium text-neutral-600">Préfixe</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentPrefix}
                onChange={(e) => setPrefix(e.target.value)}
                maxLength={5}
                className="w-24 rounded-card border border-surface-300 px-3 py-2 text-sm outline-none focus:border-ink-900"
              />
              <button
                onClick={handleSavePrefix}
                disabled={runAction.isPending}
                className="rounded-card bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40"
              >
                Enregistrer
              </button>
            </div>
          </div>

          <div className="rounded-card border border-surface-300 bg-white p-4">
            <label className="mb-1 block text-xs font-medium text-neutral-600">Couleur des embeds</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-surface-300"
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => setColor(e.target.value)}
                className="w-28 rounded-card border border-surface-300 px-3 py-2 text-sm outline-none focus:border-ink-900"
              />
              <button
                onClick={handleSaveColor}
                disabled={runAction.isPending}
                className="rounded-card bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
