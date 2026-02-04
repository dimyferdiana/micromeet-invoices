import { useState, useEffect } from 'react';

/**
 * Breakpoint definitions matching Tailwind CSS v4 defaults
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Custom hook to detect current viewport breakpoint
 *
 * Breakpoint ranges:
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: >= 1024px
 *
 * @returns Current breakpoint ('mobile', 'tablet', or 'desktop')
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // Initialize with current breakpoint on mount
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    // Media query lists for breakpoint detection
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const updateBreakpoint = () => {
      if (mobileQuery.matches) {
        setBreakpoint('mobile');
      } else if (tabletQuery.matches) {
        setBreakpoint('tablet');
      } else if (desktopQuery.matches) {
        setBreakpoint('desktop');
      }
    };

    // Initial check
    updateBreakpoint();

    // Add listeners for breakpoint changes
    mobileQuery.addEventListener('change', updateBreakpoint);
    tabletQuery.addEventListener('change', updateBreakpoint);
    desktopQuery.addEventListener('change', updateBreakpoint);

    // Cleanup listeners on unmount
    return () => {
      mobileQuery.removeEventListener('change', updateBreakpoint);
      tabletQuery.removeEventListener('change', updateBreakpoint);
      desktopQuery.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  return breakpoint;
}

/**
 * Helper hook to check if current breakpoint matches
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
}

export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'tablet';
}

export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'desktop';
}

/**
 * Helper hook to check if viewport is mobile or tablet (< 1024px)
 */
export function useIsMobileOrTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile' || breakpoint === 'tablet';
}
