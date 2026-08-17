import { CACHE_TTL_MS } from './config';
import { fetchAllBoards } from './fetchBoards';
import { buildProfiles, ProfileIndex } from './profiles';

export interface Snapshot {
    index: ProfileIndex;
    fetchedAt: number;
    itemCount: number;
    boardCount: number;
    failedBoards: { boardId: string; error: string }[];
}

interface CacheState {
    snapshot: Snapshot | null;
    /** Single-flight guard so parallel requests trigger only one board pull. */
    pending: Promise<Snapshot> | null;
}

// Survives hot reloads in dev, where module state is otherwise thrown away.
const globalCache = globalThis as typeof globalThis & { __driverCache?: CacheState };
const cache: CacheState = (globalCache.__driverCache ??= { snapshot: null, pending: null });

async function load(): Promise<Snapshot> {
    const { applications, failedBoards, boardCount } = await fetchAllBoards();

    // A missing token or a revoked account fails every board — surface that instead
    // of caching an empty database for the next 15 minutes.
    if (boardCount === 0 && failedBoards.length > 0) {
        throw new Error(failedBoards[0].error);
    }

    return {
        index: buildProfiles(applications),
        fetchedAt: Date.now(),
        itemCount: applications.length,
        boardCount,
        failedBoards,
    };
}

export function isStale(snapshot: Snapshot | null): boolean {
    return !snapshot || Date.now() - snapshot.fetchedAt > CACHE_TTL_MS;
}

export function peekSnapshot(): Snapshot | null {
    return cache.snapshot;
}

/**
 * Returns the cached board snapshot, refreshing it when it is stale or forced.
 * Concurrent callers share a single fetch.
 */
export async function getSnapshot(force = false): Promise<Snapshot> {
    if (!force && cache.snapshot && !isStale(cache.snapshot)) return cache.snapshot;
    if (cache.pending) return cache.pending;

    cache.pending = load()
        .then((snapshot) => {
            cache.snapshot = snapshot;
            return snapshot;
        })
        .finally(() => {
            cache.pending = null;
        });

    return cache.pending;
}
