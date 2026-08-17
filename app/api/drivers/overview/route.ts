import { NextRequest, NextResponse } from 'next/server';
import { ApplicationOutcome } from '@/models/driver';
import { getSnapshot } from '@/lib/services/monday/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export interface DriversOverview {
    totalRecords: number;
    totalDrivers: number;
    repeatApplicants: number;
    rejectedDrivers: number;
    hiredDrivers: number;
    terminatedDrivers: number;
    /** Drivers who were rejected at least once and still applied again. */
    reappliedAfterRejection: number;
    topBoards: { boardId: string; boardName: string; records: number }[];
    outcomeBreakdown: { outcome: ApplicationOutcome; records: number }[];
    snapshot: {
        fetchedAt: string;
        boardCount: number;
        failedBoards: { boardId: string; error: string }[];
    };
}

export async function GET(request: NextRequest) {
    try {
        const snapshot = await getSnapshot(request.nextUrl.searchParams.get('refresh') === '1');
        const profiles = Array.from(snapshot.index.profiles.values());

        const boards = new Map<string, { boardName: string; records: number }>();
        const outcomes = new Map<ApplicationOutcome, number>();

        for (const profile of profiles) {
            for (const app of profile.applications) {
                const board = boards.get(app.boardId);
                if (board) board.records++;
                else boards.set(app.boardId, { boardName: app.boardName, records: 1 });

                outcomes.set(app.outcome, (outcomes.get(app.outcome) ?? 0) + 1);
            }
        }

        const overview: DriversOverview = {
            totalRecords: snapshot.itemCount,
            totalDrivers: profiles.length,
            repeatApplicants: profiles.filter((p) => p.stats.isRepeatApplicant).length,
            rejectedDrivers: profiles.filter((p) => p.stats.rejectedCount > 0).length,
            hiredDrivers: profiles.filter((p) => p.stats.hiredCount > 0).length,
            terminatedDrivers: profiles.filter((p) => p.stats.terminatedCount > 0).length,
            reappliedAfterRejection: profiles.filter(
                (p) => p.stats.rejectedCount > 0 && p.stats.totalApplications > p.stats.rejectedCount,
            ).length,
            topBoards: Array.from(boards.entries())
                .map(([boardId, board]) => ({ boardId, ...board }))
                .sort((a, b) => b.records - a.records)
                .slice(0, 10),
            outcomeBreakdown: Array.from(outcomes.entries())
                .map(([outcome, records]) => ({ outcome, records }))
                .sort((a, b) => b.records - a.records),
            snapshot: {
                fetchedAt: new Date(snapshot.fetchedAt).toISOString(),
                boardCount: snapshot.boardCount,
                failedBoards: snapshot.failedBoards,
            },
        };

        return NextResponse.json(overview);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
