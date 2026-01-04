import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { AnimatedBackground } from '../components/AnimatedBackground';

/**
 * AppLayout
 * 
 * Main layout wrapper for authenticated pages.
 * Includes:
 * - Animated gradient background
 * - Desktop sidebar (lg screens)
 * - Mobile bottom nav (< lg screens)
 * - Main content area
 */
export function AppLayout() {
  return (
    <div className="min-h-screen">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Layout container */}
      <div className="flex">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
