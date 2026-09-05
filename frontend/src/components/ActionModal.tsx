import { useState } from 'react';
import type { DashboardAction } from '../types';
import { useRunAction } from '../api/queries';
import { useToast } from '../context/ToastContext';
import { MemberSelect } from './fields/MemberSelect';
import { ChannelSelect } from './fields/ChannelSelect';
import { DurationInput } from './fields/DurationInput';

interface ActionModalProps {
  guildId: string;
  action: DashboardAction;
  onClose: () => void;
}

export function ActionModal({ guildId, action, onClose }: ActionModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runAction = useRunAction(guildId);
  const { showToast } = useToast();

  const setValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const missingRequired = action.fields.some((f) => f.required && !values[f.key]);

  const handleSubmit = () => {
    setError(null);
    if (action.dangerous && !confirming) {
      setConfirming(true);
      return;
    }

    runAction.mutate(
      { actionKey: action.key, params: values },
      {
        onSuccess: (data) => {
          showToast(data.message, 'success');
          onClose();
        },
        onError: (err) => {
          setError(err.message);
          setConfirming(false);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-card border border-surface-300 bg-white p-5 shadow-lg">
        {!confirming ? (
          <>
            <h2 className="text-base font-semibold text-ink-900">{action.label}</h2>

            <div className="mt-4 space-y-4">
              {action.fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>

                  {field.type === 'member' && (
                    <MemberSelect guildId={guildId} value={values[field.key] || ''} onChange={(v) => setValue(field.key, v)} />
                  )}
                  {field.type === 'channel' && (
                    <ChannelSelect
                      guildId={guildId}
                      value={values[field.key] || ''}
                      onChange={(v) => setValue(field.key, v)}
                      channelType={field.channelType}
                    />
                  )}
                  {field.type === 'duration' && (
                    <DurationInput
                      value={values[field.key] || ''}
                      onChange={(v) => setValue(field.key, v)}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={values[field.key] || ''}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-card border border-surface-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900"
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={values[field.key] || ''}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="w-full rounded-card border border-surface-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-card border border-surface-300 px-4 py-2 text-sm text-ink-900 hover:bg-surface-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={missingRequired || runAction.isPending}
                className="rounded-card bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {action.dangerous ? 'Continuer' : runAction.isPending ? 'Exécution...' : 'Exécuter'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-ink-900">Êtes-vous sûr ?</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Cette action ({action.label.toLowerCase()}) ne peut pas être annulée facilement.
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="rounded-card border border-surface-300 px-4 py-2 text-sm text-ink-900 hover:bg-surface-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={runAction.isPending}
                className="rounded-card bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                {runAction.isPending ? 'Exécution...' : 'Confirmer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
