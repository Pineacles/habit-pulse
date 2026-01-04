import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Floating Sidebar - Glass Panel Design
 * 
 * Features:
 * - Floats with margin from edges
 * - Glass effect with backdrop blur
 * - Glow tab active states (orange wash + icon glow)
 * - User profile at bottom
 */
export function Sidebar() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { 
      path: '/', 
      label: 'Today', 
      icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      path: '/goals', 
      label: 'All Goals', 
      icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: (
        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="floating-sidebar hidden lg:flex">
      {/* Brand - text only with orange dot */}
      <div className="sidebar-brand">
        <span className="brand-text">Habit Pulse<span className="brand-dot">.</span></span>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
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
