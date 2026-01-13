import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { AnimatedBackground } from "../components/AnimatedBackground";

/**
 * AppLayout - Main application shell with sidebar (desktop) and bottom nav (mobile).
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
            initial={false}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
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
