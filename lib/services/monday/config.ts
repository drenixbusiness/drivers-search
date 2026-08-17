/**
 * Monday.com boards that make up the driver database.
 * Duplicates in the source list are removed by the Set below.
 */
export const MONDAY_BOARD_IDS: string[] = Array.from(
    new Set([
        '1971563558',
        '1982791964',
        '5095703986',
        '5095800333',
        '5023206586',
        '5023206983',
        '1975765917',
        '1982847753',
        '2091976233',
        '5098145383',
        '5098145419',
        '5101948793',
        '5101948852',
        '5101948870',
        '5101948914',
        '1971444510',
        '1979879440',
        '1971486093',
        '1982533098',
        '1975685235',
        '1982791767',
        '5092689164',
        '5092689191',
        '2046464283',
        '2046466868',
        '2046466978',
    ]),
);

/** How long the in-memory snapshot of every board stays fresh (ms). */
export const CACHE_TTL_MS = Number(process.env.MONDAY_CACHE_TTL_MS ?? 15 * 60 * 1000);

/** Items requested per page. Monday allows up to 500, but 200 keeps complexity low. */
export const ITEMS_PER_PAGE = 200;

/** How many boards are pulled at the same time. */
export const BOARD_CONCURRENCY = 3;
