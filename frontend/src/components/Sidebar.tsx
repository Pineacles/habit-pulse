import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { NAV_ITEMS } from '../config/navigation';
import { NavIcon } from './NavIcon';
import '../styles/components/navigation.css';

/**
 * Sidebar - Desktop navigation with user profile.
 */
export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="floating-sidebar hidden lg:flex">
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
