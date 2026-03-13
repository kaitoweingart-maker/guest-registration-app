import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children, showAdmin = false }) {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-brand-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate('/')}
          >
            Prize by Radisson
          </h1>
          <div className="flex items-center gap-3">
            {isAuthenticated && showAdmin && (
              <>
                <span className="text-sm text-brand-200">{username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-brand-800 hover:bg-brand-900 text-white text-sm px-3 py-1.5 rounded transition-colors"
                >
                  Abmelden
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
