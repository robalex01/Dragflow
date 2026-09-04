import { Navigate, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../api/queries';
import { Avatar } from '../components/Avatar';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';

export function ProfilePage() {
  const { data: user, isLoading, isError } = useCurrentUser();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (isLoading) return null;
  if (isError || !user) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      navigate('/login');
    } catch {
      showToast('Impossible de vous déconnecter.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-semibold text-ink-900">Mon profil</h1>

      <div className="mt-6 flex items-center gap-4 rounded-card border border-surface-300 bg-white p-4">
        <Avatar src={user.avatarUrl} alt={user.username} size={56} />
        <div>
          <p className="font-medium text-ink-900">{user.globalName || user.username}</p>
          <p className="text-sm text-neutral-500">@{user.username}</p>
          <p className="mt-1 font-mono text-xs text-neutral-400">{user.id}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full rounded-card border border-surface-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-surface-200"
      >
        Déconnexion
      </button>
    </div>
  );
}
