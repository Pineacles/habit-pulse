import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { NAV_ITEMS } from '../config/navigation';
import { NavIcon } from './NavIcon';
import '../styles/components/navigation.css';

/**
 * Sidebar - Desktop navigation with user profile.
 */
export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();

  const cycleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className="floating-sidebar">
      <div className="sidebar-brand">
        <span className="brand-text">Habit Pulse<span className="brand-dot">.</span></span>
      </div>

      <nav className="flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <NavIcon icon={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-mode-toggle-wrap">
        <button
          type="button"
          className="sidebar-mode-toggle"
          onClick={cycleMode}
          aria-label={`Theme mode: ${mode}. Click to toggle`}
          title={`Theme mode: ${mode}`}
        >
          {mode === 'light' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m7-9h2M3 12H5m11.657-6.657 1.414 1.414M5.929 18.071l1.414-1.414m0-9.9L5.93 5.343m12.728 12.728-1.414-1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
          {mode === 'dark' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
          <span>{mode === 'light' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="sidebar-user-details">
            <p className="sidebar-username">{user?.username}</p>
            <button onClick={logout} className="sidebar-signout">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
