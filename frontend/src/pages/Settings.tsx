import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, THEME_OPTIONS } from '../stores/themeStore';

/**
 * Settings Page
 * 
 * User settings including:
 * - Theme color customization
 * - Account info
 * - Sign out
 */
export function Settings() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-1">Settings</h1>
        <p className="text-white/50">Customize your experience</p>
      </div>

      {/* Theme section */}
      <GlassCard className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Theme Color</h2>
        <p className="text-white/50 text-sm mb-4">
          Choose your accent color for the app
        </p>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl
                transition-all duration-200
                ${theme === option.value 
                  ? 'bg-white/10 ring-2 ring-white/30' 
                  : 'bg-white/5 hover:bg-white/10'}
              `}
            >
              <div 
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-xs font-medium">{option.label}</span>
              
              {/* Checkmark for selected */}
              {theme === option.value && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white 
                              flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                          d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Account section */}
      <GlassCard className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-2xl">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.username}</p>
            <p className="text-white/50 text-sm">
              Member since {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Unknown'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-ghost text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </GlassCard>

      {/* About section */}
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">About</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Version</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Build</span>
            <span className="font-mono">MVP</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs">
            Built with ❤️ for personal productivity
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
