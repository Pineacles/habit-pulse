import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { AnimatedBackground } from "../components/AnimatedBackground";

/**
 * AppLayout - Floating Island Design
 *
 * Features:
 * - Aurora animated background (visible everywhere)
 * - Floating glass sidebar (desktop)
 * - Centered content column with max-width
 * - Mobile bottom nav
 * - Smooth page transitions
 */
export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      {/* Animated aurora background - visible behind glass */}
      <AnimatedBackground />

      {/* Floating Sidebar (desktop only) */}
      <Sidebar />

      {/* Main content area */}
      <main className="main-content min-h-screen">
        <div className="dashboard-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            style={{ minHeight: "100%", width: "100%" }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
