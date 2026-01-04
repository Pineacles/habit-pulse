import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Sidebar
 * 
 * Desktop navigation sidebar:
 * - Collapsible (280px → 64px)
 * - Sticky positioning
 * - Active state indicators
 * - User profile at bottom
 */
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  const navItems = [
    { 
      path: '/', 
      label: 'Today', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      path: '/goals', 
      label: 'All Goals', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <aside 
      className={`
        hidden lg:flex flex-col glass-solid h-screen sticky top-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <span className="font-bold text-lg">Habit Pulse</span>
          </div>
        )}
        
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center
                     transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl mb-1
              transition-all duration-200
              ${isActive 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {item.icon}
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-white/10">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-lg">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.username}</p>
              <button
                onClick={logout}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
