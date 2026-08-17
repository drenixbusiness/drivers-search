import { ApplicationOutcome, DriverApplication } from '@/models/driver';

export interface RawColumn {
    id: string;
    title: string;
    type: string;
}

export interface RawItem {
    id: string;
    name: string;
    created_at: string | null;
    updated_at: string | null;
    group: { title: string } | null;
    column_values: {
        id: string;
        type: string;
        text: string | null;
        display_value?: string | null;
    }[];
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE_RE = /(?:\+?\d[\d\s().-]{8,}\d)/g;

const PHONE_TITLE_RE = /\b(phone|cell|mobile|tel|contact\s*number|number)\b/i;
const EMAIL_TITLE_RE = /\b(e-?mail)\b/i;
const NAME_TITLE_RE = /\b(driver|full\s*name|first\s*name|last\s*name|name)\b/i;
const COMPANY_TITLE_RE = /\b(company|carrier|dispatch|fleet|owner|mc\s*number|dot)\b/i;
const STATUS_TITLE_RE = /\b(status|stage|result|decision|disposition)\b/i;
const NOTE_TITLE_RE = /\b(notes?|comments?|remarks?|feedback)\b/i;

/** Columns that never carry useful information in the detail view. */
const NOISE_TITLE_RE = /\b(subitems|last updated|creation log|item id|auto number)\b/i;

const REJECTED_RE =
    /\b(reject|denied|decline|disqualif|not\s*qualified|unqualified|no\s*hire|do\s*not\s*hire|dnh|dnu|blacklist|black\s*list|failed|fail)\b/i;
const TERMINATED_RE =
    /\b(terminat|fired|quit|resign|left|no\s*longer|former|ex[-\s]?driver|abandon|inactive|deactivat|off\s*board|offboard)\b/i;
const HIRED_RE =
    /\b(hired|hire|onboard|on\s*board|active|working|approved|passed|orientation|current\s*driver|employed|accepted)\b/i;
const IN_PROGRESS_RE =
    /\b(new|applic|apply|applied|lead|pending|review|interview|follow\s*up|contact|process|screening|in\s*progress|waiting|recruit|prospect|not\s*touched)\b/i;

export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7) return '';
    // US numbers are stored with and without the leading 1 — compare the last 10 digits.
    return digits.length > 10 ? digits.slice(-10) : digits;
}

export function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

export function normalizeName(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .sort()
        .join(' ');
}

function pushUnique(target: string[], value: string) {
    const trimmed = value.trim();
    if (trimmed && !target.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
        target.push(trimmed);
    }
}

function classify(text: string): ApplicationOutcome {
    if (!text) return 'unknown';
    if (REJECTED_RE.test(text)) return 'rejected';
    if (TERMINATED_RE.test(text)) return 'terminated';
    if (HIRED_RE.test(text)) return 'hired';
    if (IN_PROGRESS_RE.test(text)) return 'in_progress';
    return 'unknown';
}

/**
 * Works out what happened to an application from its status column, its group
 * and — as a last resort — the name of the board it lives on.
 */
function inferOutcome(status: string, groupName: string, boardName: string): ApplicationOutcome {
    const fromStatus = classify(status);
    if (fromStatus !== 'unknown') return fromStatus;

    const fromGroup = classify(groupName);
    if (fromGroup !== 'unknown') return fromGroup;

    return classify(boardName);
}

export function toApplication(
    item: RawItem,
    boardId: string,
    boardName: string,
    columns: RawColumn[],
): DriverApplication {
    const titleById = new Map(columns.map((c) => [c.id, c.title]));

    const phones: string[] = [];
    const emails: string[] = [];
    const fields: DriverApplication['fields'] = [];
    const notes: DriverApplication['notes'] = [];
    let company = '';
    let status = '';
    const nameParts: string[] = [];

    for (const cv of item.column_values) {
        const value = (cv.text ?? cv.display_value ?? '').trim();
        if (!value) continue;

        const title = titleById.get(cv.id) ?? cv.id;
        if (!NOISE_TITLE_RE.test(title)) fields.push({ id: cv.id, title, value });
        if (NOTE_TITLE_RE.test(title)) notes.push({ id: cv.id, title, value });

        if (cv.type === 'phone' || PHONE_TITLE_RE.test(title)) {
            for (const m of value.match(PHONE_RE) ?? [value]) pushUnique(phones, m.trim());
        }
        if (cv.type === 'email' || EMAIL_TITLE_RE.test(title)) {
            for (const m of value.match(EMAIL_RE) ?? []) pushUnique(emails, m);
        }
        // Contact details are often typed into a plain text column, so scan every value.
        for (const m of value.match(EMAIL_RE) ?? []) pushUnique(emails, m);

        if (!company && COMPANY_TITLE_RE.test(title)) company = value;
        if (!status && (cv.type === 'status' || STATUS_TITLE_RE.test(title))) status = value;
        if (NAME_TITLE_RE.test(title) && !PHONE_TITLE_RE.test(title)) nameParts.push(value);
    }

    const groupName = item.group?.title ?? '';
    // The item name is the driver name on most boards; fall back to name columns.
    const name = item.name?.trim() || nameParts.join(' ').trim() || 'Unnamed';

    return {
        itemId: item.id,
        boardId,
        boardName,
        groupName,
        name,
        phones: phones.map((p) => p.trim()).filter((p) => normalizePhone(p)),
        emails,
        company,
        status,
        outcome: inferOutcome(status, groupName, boardName),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        url: `https://view.monday.com/boards/${boardId}/pulses/${item.id}`,
        fields,
        notes,
    };
}
