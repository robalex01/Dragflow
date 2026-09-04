const API_BASE = import.meta.env.VITE_API_URL || '';

export function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  const ERROR_MESSAGES: Record<string, string> = {
    discord_denied: 'Vous avez refusé la connexion avec Discord.',
    invalid_state: 'La session a expiré, veuillez réessayer.',
    session_failed: "Impossible de créer votre session, veuillez réessayer.",
    oauth_failed: 'La connexion avec Discord a échoué, veuillez réessayer.',
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-card bg-ink-900 text-lg font-semibold text-white">
          D
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Dragflow</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Le contrôle de votre serveur Discord, simplement.
        </p>

        {error && (
          <div className="mt-4 rounded-card border border-l-4 border-l-red-500 border-surface-300 bg-white px-4 py-3 text-left text-sm text-ink-900">
            {ERROR_MESSAGES[error] || 'Une erreur est survenue, veuillez réessayer.'}
          </div>
        )}

        <a
          href={`${API_BASE}/api/auth/discord`}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-card bg-[#5865F2] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4752C4]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.245.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.893.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028z" />
          </svg>
          Continuer avec Discord
        </a>

        <p className="mt-4 text-xs text-neutral-400">
          Connectez-vous avec Discord pour accéder à votre espace.
        </p>
      </div>
    </div>
  );
}
