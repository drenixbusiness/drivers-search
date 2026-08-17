import { NextRequest, NextResponse } from 'next/server';
import { DriverSearchResponse } from '@/models/driver';
import { getSnapshot } from '@/lib/services/monday/cache';
import { searchProfiles } from '@/lib/services/monday/profiles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MAX_RESULTS = 200;

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const name = params.get('name')?.trim() ?? '';
    const phone = params.get('phone')?.trim() ?? '';
    const email = params.get('email')?.trim() ?? '';

    // Nothing to search for — the UI shows its "type what you are looking for" state.
    if (!name && !phone && !email) {
        return NextResponse.json<DriverSearchResponse>({
            profiles: [],
            total: 0,
            truncated: false,
            snapshot: { fetchedAt: '', itemCount: 0, boardCount: 0, failedBoards: [] },
        });
    }

    try {
        const snapshot = await getSnapshot(params.get('refresh') === '1');
        const found = searchProfiles(snapshot.index, { name, phone, email });

        return NextResponse.json<DriverSearchResponse>({
            profiles: found.slice(0, MAX_RESULTS),
            total: found.length,
            truncated: found.length > MAX_RESULTS,
            snapshot: {
                fetchedAt: new Date(snapshot.fetchedAt).toISOString(),
                itemCount: snapshot.itemCount,
                boardCount: snapshot.boardCount,
                failedBoards: snapshot.failedBoards,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
