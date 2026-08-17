const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_VERSION = '2024-10';

export class MondayError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
        this.name = 'MondayError';
    }
}

function token(): string {
    const t = process.env.MONDAY_API_TOKEN;
    if (!t) {
        throw new MondayError(
            'MONDAY_API_TOKEN is not set. Add it to .env.local (see .env).',
            500,
        );
    }
    return t;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs a GraphQL query against the Monday API.
 * Retries on rate limits (429) and on the "complexity budget exhausted" error,
 * both of which Monday answers with a retry_in_seconds hint.
 */
export async function mondayQuery<T>(
    query: string,
    variables: Record<string, unknown> = {},
    attempt = 0,
): Promise<T> {
    const res = await fetch(MONDAY_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token(),
            'API-Version': API_VERSION,
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
    });

    if (res.status === 429 || res.status === 503) {
        if (attempt >= 4) throw new MondayError('Monday rate limit exceeded', res.status);
        const wait = Number(res.headers.get('retry-after') ?? 0) * 1000 || 2000 * (attempt + 1);
        await sleep(wait);
        return mondayQuery<T>(query, variables, attempt + 1);
    }

    if (!res.ok) {
        throw new MondayError(`Monday API responded with ${res.status}: ${await res.text()}`, res.status);
    }

    const body = (await res.json()) as {
        data?: T;
        errors?: { message: string }[];
        error_message?: string;
        error_code?: string;
    };

    const message = body.errors?.map((e) => e.message).join('; ') ?? body.error_message;

    if (message) {
        const throttled = /complexity|minute rate limit|budget exhausted/i.test(message);
        if (throttled && attempt < 4) {
            const seconds = Number(/(\d+)\s*seconds/i.exec(message)?.[1] ?? 0);
            await sleep(seconds ? seconds * 1000 : 5000 * (attempt + 1));
            return mondayQuery<T>(query, variables, attempt + 1);
        }
        throw new MondayError(message);
    }

    if (!body.data) throw new MondayError('Monday API returned an empty response');
    return body.data;
}

/** Runs tasks with a fixed level of parallelism. */
export async function mapWithConcurrency<In, Out>(
    items: In[],
    limit: number,
    worker: (item: In, index: number) => Promise<Out>,
): Promise<Out[]> {
    const results = new Array<Out>(items.length);
    let cursor = 0;

    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await worker(items[index], index);
        }
    });

    await Promise.all(runners);
    return results;
}
