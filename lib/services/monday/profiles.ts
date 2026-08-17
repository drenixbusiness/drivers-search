import { DriverApplication, DriverProfile, DriverStats } from '@/models/driver';
import { normalizeEmail, normalizeName, normalizePhone } from './normalize';

/** Minimal union-find over the identity keys of the records. */
class UnionFind {
    private parent = new Map<string, string>();

    find(key: string): string {
        let root = this.parent.get(key);
        if (root === undefined) {
            this.parent.set(key, key);
            return key;
        }
        while (root !== this.parent.get(root)) root = this.parent.get(root)!;
        this.parent.set(key, root);
        return root;
    }

    union(a: string, b: string) {
        const rootA = this.find(a);
        const rootB = this.find(b);
        if (rootA !== rootB) this.parent.set(rootB, rootA);
    }
}

const OUTCOME_RANK: Record<DriverApplication['outcome'], number> = {
    hired: 4,
    terminated: 3,
    rejected: 2,
    in_progress: 1,
    unknown: 0,
};

function identityKeys(app: DriverApplication) {
    const keys: { key: string; via: 'phone' | 'email' | 'name' }[] = [];

    for (const phone of app.phones) {
        const digits = normalizePhone(phone);
        if (digits) keys.push({ key: `phone:${digits}`, via: 'phone' });
    }
    for (const email of app.emails) {
        const normalized = normalizeEmail(email);
        if (normalized) keys.push({ key: `email:${normalized}`, via: 'email' });
    }

    // A full name (two words or more) links records where the contact details differ,
    // which is exactly how a repeat applicant usually shows up.
    const name = normalizeName(app.name);
    if (name.split(' ').length >= 2 && name.length >= 6) {
        keys.push({ key: `name:${name}`, via: 'name' });
    }

    return keys;
}

function timeOf(app: DriverApplication): number {
    const raw = app.createdAt ?? app.updatedAt;
    const time = raw ? Date.parse(raw) : NaN;
    return Number.isNaN(time) ? 0 : time;
}

function buildStats(applications: DriverApplication[]): DriverStats {
    const times = applications.map(timeOf).filter(Boolean).sort((a, b) => a - b);
    const count = (outcome: DriverApplication['outcome']) =>
        applications.filter((a) => a.outcome === outcome).length;

    return {
        totalApplications: applications.length,
        boardsCount: new Set(applications.map((a) => a.boardId)).size,
        hiredCount: count('hired'),
        rejectedCount: count('rejected'),
        terminatedCount: count('terminated'),
        inProgressCount: count('in_progress'),
        firstSeenAt: times.length ? new Date(times[0]).toISOString() : null,
        lastSeenAt: times.length ? new Date(times[times.length - 1]).toISOString() : null,
        isRepeatApplicant: applications.length > 1,
    };
}

function mergeValues(applications: DriverApplication[], pick: (a: DriverApplication) => string[]) {
    const seen = new Map<string, string>();
    for (const app of applications) {
        for (const value of pick(app)) {
            const trimmed = value.trim();
            if (trimmed && !seen.has(trimmed.toLowerCase())) seen.set(trimmed.toLowerCase(), trimmed);
        }
    }
    return Array.from(seen.values());
}

function buildProfile(key: string, applications: DriverApplication[]): DriverProfile {
    // Newest first — the top row of the history is the most recent application.
    const sorted = [...applications].sort((a, b) => timeOf(b) - timeOf(a));

    const names = mergeValues(sorted, (a) => [a.name]).filter((n) => n !== 'Unnamed');
    const linkedBy = new Set<'phone' | 'email' | 'name'>();
    if (sorted.length > 1) {
        for (const app of sorted) for (const k of identityKeys(app)) linkedBy.add(k.via);
    }

    const latest = sorted.find((a) => a.outcome !== 'unknown') ?? sorted[0];

    return {
        key,
        fullName: names[0] ?? sorted[0].name,
        aliases: names.slice(1),
        phones: mergeValues(sorted, (a) => a.phones),
        emails: mergeValues(sorted, (a) => a.emails),
        companies: mergeValues(sorted, (a) => (a.company ? [a.company] : [])),
        linkedBy: Array.from(linkedBy),
        latestOutcome: latest.outcome,
        stats: buildStats(sorted),
        applications: sorted,
    };
}

export interface ProfileIndex {
    profiles: Map<string, DriverProfile>;
    /** Identity key -> profile key, used to answer a search without a full scan. */
    byPhone: Map<string, Set<string>>;
    byEmail: Map<string, Set<string>>;
    /** Every profile key with the searchable text of the profile. */
    searchable: { key: string; name: string; phones: string[]; emails: string[] }[];
}

/** Groups every board record into one profile per physical person. */
export function buildProfiles(applications: DriverApplication[]): ProfileIndex {
    const uf = new UnionFind();

    // Link every record to all of its identity keys.
    for (const app of applications) {
        const itemKey = `item:${app.boardId}:${app.itemId}`;
        uf.find(itemKey);
        for (const { key } of identityKeys(app)) uf.union(itemKey, key);
    }

    const grouped = new Map<string, DriverApplication[]>();
    for (const app of applications) {
        const root = uf.find(`item:${app.boardId}:${app.itemId}`);
        const bucket = grouped.get(root);
        if (bucket) bucket.push(app);
        else grouped.set(root, [app]);
    }

    const profiles = new Map<string, DriverProfile>();
    const byPhone = new Map<string, Set<string>>();
    const byEmail = new Map<string, Set<string>>();
    const searchable: ProfileIndex['searchable'] = [];

    for (const [root, apps] of Array.from(grouped.entries())) {
        const profile = buildProfile(root, apps);
        profiles.set(root, profile);

        const phones: string[] = [];
        const emails: string[] = [];

        for (const phone of profile.phones) {
            const digits = normalizePhone(phone);
            if (!digits) continue;
            phones.push(digits);
            if (!byPhone.has(digits)) byPhone.set(digits, new Set());
            byPhone.get(digits)!.add(root);
        }
        for (const email of profile.emails) {
            const normalized = normalizeEmail(email);
            if (!normalized) continue;
            emails.push(normalized);
            if (!byEmail.has(normalized)) byEmail.set(normalized, new Set());
            byEmail.get(normalized)!.add(root);
        }

        searchable.push({
            key: root,
            name: [profile.fullName, ...profile.aliases].join(' ').toLowerCase(),
            phones,
            emails,
        });
    }

    return { profiles, byPhone, byEmail, searchable };
}

export interface SearchQuery {
    name?: string;
    phone?: string;
    email?: string;
}

/** Returns the profiles that match every filled-in filter. */
export function searchProfiles(index: ProfileIndex, query: SearchQuery): DriverProfile[] {
    const name = query.name?.trim().toLowerCase() ?? '';
    const phone = query.phone ? normalizePhone(query.phone) : '';
    const rawPhone = query.phone?.replace(/\D/g, '') ?? '';
    const email = query.email?.trim().toLowerCase() ?? '';

    if (!name && !rawPhone && !email) return [];

    const nameTokens = name.split(/\s+/).filter(Boolean);

    const matches = index.searchable.filter((entry) => {
        if (nameTokens.length && !nameTokens.every((token) => entry.name.includes(token))) {
            return false;
        }
        if (rawPhone) {
            // A partial phone still matches — the filter is a substring of the digits.
            const needle = phone || rawPhone;
            if (!entry.phones.some((p) => p.includes(needle))) return false;
        }
        if (email && !entry.emails.some((e) => e.includes(email))) return false;
        return true;
    });

    const lastSeen = (profile: DriverProfile) =>
        profile.stats.lastSeenAt ? Date.parse(profile.stats.lastSeenAt) : 0;

    return matches
        .map((entry) => index.profiles.get(entry.key)!)
        .sort(
            (a, b) =>
                b.stats.totalApplications - a.stats.totalApplications ||
                lastSeen(b) - lastSeen(a) ||
                a.fullName.localeCompare(b.fullName),
        );
}
