/**
 * Shared navigation configuration for both desktop and mobile navigation.
 * Using the Priority+ pattern for mobile to handle overflow items gracefully.
 */

export interface NavItem {
  path: string;
  label: string;
  icon: string; // icon identifier, resolved by NavIcon component
  mobilePosition: number; // lower = always visible, higher = overflow
  mobilePriority: 'always' | 'overflow';
}

export const NAV_ITEMS: NavItem[] = [
  { 
    path: '/', 
    label: 'Today', 
    icon: 'today', 
    mobilePosition: 1, 
    mobilePriority: 'always' 
  },
  { 
    path: '/goals', 
    label: 'Habits', 
    icon: 'habits', 
    mobilePosition: 2, 
    mobilePriority: 'always' 
  },
  { 
    path: '/events', 
    label: 'Events', 
    icon: 'events', 
    mobilePosition: 3, 
    mobilePriority: 'always' 
  },
  { 
    path: '/calendar', 
    label: 'Calendar', 
    icon: 'calendar', 
    mobilePosition: 4, 
    mobilePriority: 'always' 
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: 'settings', 
    mobilePosition: 5, 
    mobilePriority: 'overflow' 
  },
];

// Maximum number of navigation items to show directly on mobile (before overflow)
export const MAX_VISIBLE_MOBILE_NAV = 4;
