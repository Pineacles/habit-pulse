import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { AnimatedBackground } from '../components/AnimatedBackground';

/**
 * AppLayout - Floating Island Design
 * 
 * Features:
 * - Aurora animated background (visible everywhere)
 * - Floating glass sidebar (desktop)
 * - Centered content column with max-width
 * - Mobile bottom nav
 */
export function AppLayout() {
  return (
    <div className="min-h-screen">
      {/* Animated aurora background - visible behind glass */}
      <AnimatedBackground />

      {/* Floating Sidebar (desktop only) */}
      <Sidebar />

      {/* Main content area */}
      <main className="main-content min-h-screen">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
