import { NavLink, useNavigate } from 'react-router-dom';
import { useCategories } from '../api/queries';
import type { DashboardUser } from '../types';
import { Avatar } from './Avatar';
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../api/client';

interface SidebarProps {
  guildId: string;
  user: DashboardUser;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function linkClasses(isActive: boolean) {
  return `block rounded-card px-3 py-2 text-sm transition ${
    isActive ? 'bg-ink-900 text-white' : 'text-neutral-600 hover:bg-surface-200 hover:text-ink-900'
  }`;
}

export function Sidebar({ guildId, user, mobileOpen, onCloseMobile }: SidebarProps) {
  const { data: categories, isLoading } = useCategories(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch {
      showToast('Impossible de vous déconnecter.', 'error');
    }
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-surface-300 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-surface-300 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-card bg-ink-900 text-sm font-semibold text-white">
            D
          </div>
          <span className="text-sm font-semibold tracking-wide text-ink-900">DRAGFLOW</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLink to={`/servers/${guildId}`} end className={({ isActive }) => linkClasses(isActive)}>
            Vue d'ensemble
          </NavLink>
          <NavLink to={`/servers`} className={() => linkClasses(false)}>
            ← Changer de serveur
          </NavLink>
          <NavLink to={`/servers/${guildId}/commands`} className={({ isActive }) => linkClasses(isActive)}>
            Commandes
          </NavLink>
          <NavLink to={`/servers/${guildId}/category/moderation`} className={({ isActive }) => linkClasses(isActive)}>
            Modération
          </NavLink>
          <NavLink to={`/servers/${guildId}/category/configuration`} className={({ isActive }) => linkClasses(isActive)}>
            Configuration
          </NavLink>

          <p className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Autres catégories
          </p>

          {isLoading && (
            <div className="space-y-2 px-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-surface-300" />
              ))}
            </div>
          )}

          {categories?.filter((cat) => !['moderation', 'configuration'].includes(cat.key)).map((cat) => (
            <NavLink
              key={cat.key}
              to={`/servers/${guildId}/category/${cat.key}`}
              className={({ isActive }) => linkClasses(isActive)}
            >
              {cat.label}
              <span className="ml-2 text-xs text-neutral-400">{cat.commandCount}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative border-t border-surface-300 p-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-card px-2 py-2 text-left transition hover:bg-surface-200"
          >
            <Avatar src={user.avatarUrl} alt={user.username} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">
                {user.globalName || user.username}
              </p>
              <p className="truncate text-xs text-neutral-500">@{user.username}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute bottom-16 left-3 right-3 rounded-card border border-surface-300 bg-white py-1 shadow-md">
              <NavLink
                to="/profile"
                className="block px-3 py-2 text-sm text-ink-900 hover:bg-surface-200"
                onClick={() => setMenuOpen(false)}
              >
                Mon profil
              </NavLink>
              <button
                onClick={handleLogout}
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-surface-200"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
