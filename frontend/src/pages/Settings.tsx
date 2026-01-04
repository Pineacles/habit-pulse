import { useAuthStore } from '../stores/authStore';
import { useThemeStore, THEME_OPTIONS } from '../stores/themeStore';

/**
 * Settings Page - Island Card Design
 * 
 * Features:
 * - Grouped settings in glass island cards
 * - Theme color picker with glow effect
 * - Clean account section
 */
export function Settings() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize your experience</p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        {/* Theme section */}
        <div className="settings-card">
          <h2 className="settings-section-title">Theme Color</h2>
          <p className="settings-description">
            Choose your accent color for the app
          </p>
          
          <div className="color-options">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`color-option ${theme === option.value ? 'active' : ''}`}
                title={option.label}
              >
                <div 
                  className="color-circle"
                  style={{ 
                    backgroundColor: option.color,
                    boxShadow: theme === option.value 
                      ? `0 0 20px ${option.color}` 
                      : 'none'
                  }}
                />
                <span className="color-label">{option.label}</span>
                
                {/* Checkmark for selected */}
                {theme === option.value && (
                  <div className="color-check">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                            d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Account section */}
        <div className="settings-card">
          <h2 className="settings-section-title">Account</h2>
          
          <div className="account-info">
            <div className="account-avatar">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="account-details">
              <p className="account-name">{user?.username}</p>
              <p className="account-email">{user?.email}</p>
              <p className="account-member">
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
            className="signout-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* About section */}
        <div className="settings-card">
          <h2 className="settings-section-title">About</h2>
          
          <div className="about-info">
            <div className="about-row">
              <span className="about-label">Version</span>
              <span className="about-value">1.0.0</span>
            </div>
            <div className="about-row">
              <span className="about-label">Build</span>
              <span className="about-value">MVP</span>
            </div>
          </div>

          <div className="about-footer">
            Built with ❤️ for personal productivity
          </div>
        </div>
      </div>
    </>
  );
}
