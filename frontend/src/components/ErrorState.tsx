interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-surface-300 bg-white px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink-900">
        {message || 'Impossible de récupérer ces informations.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-card border border-surface-300 px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-surface-200"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
