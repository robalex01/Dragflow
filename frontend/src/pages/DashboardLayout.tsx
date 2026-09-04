import { useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useCurrentUser } from '../api/queries';
import { Sidebar } from '../components/Sidebar';

export function DashboardLayout() {
  const { guildId } = useParams<{ guildId: string }>();
  const { data: user, isLoading, isError } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return null; // le routeur racine gère déjà l'état de chargement global
  if (isError || !user || !guildId) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-surface-100">
      <Sidebar guildId={guildId} user={user} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-surface-300 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className="rounded-card p-2 hover:bg-surface-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-ink-900">DRAGFLOW</span>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
