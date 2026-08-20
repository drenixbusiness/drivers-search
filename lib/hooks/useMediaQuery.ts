'use client'

import {useEffect, useState} from "react";

/**
 * SSR-safe media query hook: always false on the server and on the first client
 * render, then updated after mount, so it never causes a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const update = () => setMatches(mql.matches);

        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, [query]);

    return matches;
}

/** True below antd's `lg` breakpoint, where the sidebar turns into a drawer. */
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 991px)');
}
