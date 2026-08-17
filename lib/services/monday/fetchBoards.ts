import { DriverApplication } from '@/models/driver';
import { BOARD_CONCURRENCY, ITEMS_PER_PAGE, MONDAY_BOARD_IDS } from './config';
import { mapWithConcurrency, mondayQuery } from './client';
import { RawColumn, RawItem, toApplication } from './normalize';

const ITEM_FIELDS = `
    id
    name
    created_at
    updated_at
    group { title }
    column_values {
        id
        type
        text
        ... on MirrorValue { display_value }
        ... on BoardRelationValue { display_value }
        ... on DependencyValue { display_value }
    }
`;

const FIRST_PAGE = `
    query BoardPage($boardId: ID!, $limit: Int!) {
        boards(ids: [$boardId]) {
            id
            name
            columns { id title type }
            items_page(limit: $limit) {
                cursor
                items { ${ITEM_FIELDS} }
            }
        }
    }
`;

const NEXT_PAGE = `
    query NextPage($cursor: String!, $limit: Int!) {
        next_items_page(cursor: $cursor, limit: $limit) {
            cursor
            items { ${ITEM_FIELDS} }
        }
    }
`;

interface BoardPageResult {
    boards: {
        id: string;
        name: string;
        columns: RawColumn[];
        items_page: { cursor: string | null; items: RawItem[] };
    }[];
}

interface NextPageResult {
    next_items_page: { cursor: string | null; items: RawItem[] };
}

async function fetchBoard(boardId: string): Promise<DriverApplication[]> {
    const first = await mondayQuery<BoardPageResult>(FIRST_PAGE, {
        boardId,
        limit: ITEMS_PER_PAGE,
    });

    const board = first.boards?.[0];
    if (!board) return [];

    const boardName = board.name ?? boardId;
    const applications = board.items_page.items.map((item) =>
        toApplication(item, boardId, boardName, board.columns),
    );

    let cursor = board.items_page.cursor;
    // Monday caps a cursor walk at 500 pages; the guard keeps a broken cursor from looping.
    for (let page = 0; cursor && page < 500; page++) {
        const next = await mondayQuery<NextPageResult>(NEXT_PAGE, {
            cursor,
            limit: ITEMS_PER_PAGE,
        });
        for (const item of next.next_items_page.items) {
            applications.push(toApplication(item, boardId, boardName, board.columns));
        }
        cursor = next.next_items_page.cursor;
    }

    return applications;
}

export interface BoardsSnapshot {
    applications: DriverApplication[];
    failedBoards: { boardId: string; error: string }[];
    boardCount: number;
}

/** Pulls every item of every configured board. */
export async function fetchAllBoards(): Promise<BoardsSnapshot> {
    const failedBoards: { boardId: string; error: string }[] = [];

    const perBoard = await mapWithConcurrency(
        MONDAY_BOARD_IDS,
        BOARD_CONCURRENCY,
        async (boardId) => {
            try {
                return await fetchBoard(boardId);
            } catch (error) {
                failedBoards.push({
                    boardId,
                    error: error instanceof Error ? error.message : String(error),
                });
                return [] as DriverApplication[];
            }
        },
    );

    return {
        applications: perBoard.flat(),
        failedBoards,
        boardCount: MONDAY_BOARD_IDS.length - failedBoards.length,
    };
}
