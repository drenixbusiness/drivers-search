import {NextResponse} from 'next/server';
import {AppNotification, NotificationsResponse} from '@/models/notification';
import {isStale, peekSnapshot} from '@/lib/services/monday/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Notifications are derived from the Monday snapshot that is already in memory.
 * It only peeks at the cache, so opening the bell never triggers a board pull.
 */
export async function GET() {
    const snapshot = peekSnapshot();
    const notifications: AppNotification[] = [];

    if (!snapshot) {
        notifications.push({
            id: 'sync:pending',
            level: 'info',
            title: 'Monday data not loaded yet',
            description: 'Open the dashboard or run a driver search to pull the boards.',
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json<NotificationsResponse>({notifications});
    }

    const syncedAt = new Date(snapshot.fetchedAt).toISOString();

    notifications.push({
        id: `sync:${snapshot.fetchedAt}`,
        level: 'success',
        title: 'Boards synced',
        description: `${snapshot.itemCount.toLocaleString()} records loaded from ${snapshot.boardCount} Monday boards.`,
        createdAt: syncedAt,
    });

    if (isStale(snapshot)) {
        notifications.push({
            id: `sync:stale:${snapshot.fetchedAt}`,
            level: 'info',
            title: 'Data is out of date',
            description: 'The snapshot has expired. The next search refreshes it automatically.',
            createdAt: syncedAt,
        });
    }

    for (const board of snapshot.failedBoards) {
        notifications.push({
            id: `board-failed:${board.boardId}:${snapshot.fetchedAt}`,
            level: 'warning',
            title: `Board ${board.boardId} could not be read`,
            description: board.error,
            createdAt: syncedAt,
        });
    }

    const profiles = Array.from(snapshot.index.profiles.values());
    const repeat = profiles.filter((p) => p.stats.isRepeatApplicant).length;
    const reapplied = profiles.filter(
        (p) => p.stats.rejectedCount > 0 && p.stats.totalApplications > p.stats.rejectedCount,
    ).length;

    if (repeat > 0) {
        notifications.push({
            id: `insight:repeat:${snapshot.fetchedAt}`,
            level: 'info',
            title: `${repeat.toLocaleString()} repeat applicants`,
            description: `${repeat.toLocaleString()} of ${profiles.length.toLocaleString()} drivers appear on more than one record.`,
            createdAt: syncedAt,
        });
    }

    if (reapplied > 0) {
        notifications.push({
            id: `insight:reapplied:${snapshot.fetchedAt}`,
            level: 'warning',
            title: `${reapplied.toLocaleString()} re-applied after a rejection`,
            description: 'These drivers were rejected at least once and still have another application.',
            createdAt: syncedAt,
        });
    }

    return NextResponse.json<NotificationsResponse>({notifications});
}
