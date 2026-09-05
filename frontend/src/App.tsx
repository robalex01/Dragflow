import { Navigate, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from './api/queries';
import { LoginPage } from './pages/LoginPage';
import { ServersPage } from './pages/ServersPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { CommandsPage } from './pages/CommandsPage';
import { CategoryPage } from './pages/CategoryPage';
import { ModerationPage } from './pages/ModerationPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { ProfilePage } from './pages/ProfilePage';

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-300 border-t-ink-900" />
    </div>
  );
}

/** Redirige vers /login si aucune session valide n'est trouvée côté serveur. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <FullPageSpinner />;
  if (isError || !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/servers" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/servers"
        element={
          <RequireAuth>
            <ServersPage />
          </RequireAuth>
        }
      />

      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />

      <Route
        path="/servers/:guildId"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="commands" element={<CommandsPage />} />
        <Route path="category/moderation" element={<ModerationPage />} />
        <Route path="category/configuration" element={<ConfigurationPage />} />
        <Route path="category/:categoryKey" element={<CategoryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/servers" replace />} />
    </Routes>
  );
}
