import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS, MAX_VISIBLE_MOBILE_NAV } from "../config/navigation";
import { NavIcon } from "./NavIcon";
import "../styles/components/navigation.css";

/**
 * BottomNav - Mobile navigation bar with Priority+ pattern.
 * Shows MAX_VISIBLE_MOBILE_NAV items directly, remaining in overflow menu.
 */
export function BottomNav() {
  const location = useLocation();
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  // Close overflow menu when route changes
  useEffect(() => {
    setIsOverflowOpen(false);
  }, [location.pathname]);

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOverflowOpen && !(e.target as HTMLElement).closest('.bottom-nav-overflow-container')) {
        setIsOverflowOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOverflowOpen]);

  // Separate visible and overflow items based on Priority+ config
  const visibleItems = NAV_ITEMS.filter(
    (item) => item.mobilePriority === 'always' && item.mobilePosition <= MAX_VISIBLE_MOBILE_NAV
  );
  const overflowItems = NAV_ITEMS.filter(
    (item) => item.mobilePriority === 'overflow' || item.mobilePosition > MAX_VISIBLE_MOBILE_NAV
  );

  const hasOverflow = overflowItems.length > 0;
  const isOverflowItemActive = overflowItems.some((item) => 
    item.path === location.pathname || (item.path === '/' && location.pathname === '/')
  );

  return (
    <nav className="bottom-nav lg:hidden">
      <div className="bottom-nav-container">
        {/* Always-visible navigation items */}
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <NavIcon icon={item.icon} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}

        {/* Overflow "More" menu button */}
        {hasOverflow && (
          <div className="bottom-nav-overflow-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOverflowOpen(!isOverflowOpen);
              }}
              className={`bottom-nav-item ${isOverflowItemActive ? "active" : ""}`}
              aria-label="More options"
              aria-expanded={isOverflowOpen}
            >
              <NavIcon icon="more" className="bottom-nav-icon" />
              <span className="bottom-nav-label">More</span>
            </button>

            {/* Overflow menu backdrop and panel */}
            <AnimatePresence>
              {isOverflowOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bottom-nav-overflow-backdrop"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOverflowOpen(false);
                    }}
                  />
                  <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 35,
                      stiffness: 400,
                      mass: 0.8,
                    }}
                    className="bottom-nav-overflow-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {overflowItems.map((item) => {
                      const isActive = 
                        item.path === location.pathname || 
                        (item.path === '/' && location.pathname === '/');
                      
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === '/'}
                          className={`bottom-nav-overflow-item ${isActive ? 'active' : ''}`}
                        >
                          <NavIcon icon={item.icon} className="w-5 h-5" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
}
