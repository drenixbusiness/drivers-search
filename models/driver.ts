export type ApplicationOutcome =
    | 'hired'
    | 'rejected'
    | 'terminated'
    | 'in_progress'
    | 'unknown';

/** One row on one Monday board — a single application / record of a driver. */
export interface DriverApplication {
    itemId: string;
    boardId: string;
    boardName: string;
    groupName: string;
    name: string;
    phones: string[];
    emails: string[];
    company: string;
    status: string;
    outcome: ApplicationOutcome;
    createdAt: string | null;
    updatedAt: string | null;
    url: string;
    /** Every non-empty column of the row, so the detail view can show the raw record. */
    fields: { id: string; title: string; value: string }[];
    /** Content of the Note / Comment columns of the board. */
    notes: { id: string; title: string; value: string }[];
}

export interface DriverStats {
    totalApplications: number;
    boardsCount: number;
    hiredCount: number;
    rejectedCount: number;
    terminatedCount: number;
    inProgressCount: number;
    firstSeenAt: string | null;
    lastSeenAt: string | null;
    isRepeatApplicant: boolean;
}

/** All records that belong to the same physical person, merged together. */
export interface DriverProfile {
    key: string;
    fullName: string;
    /** Other spellings of the name found across the boards. */
    aliases: string[];
    phones: string[];
    emails: string[];
    companies: string[];
    /** Which signals merged these records: phone / email / name. */
    linkedBy: ('phone' | 'email' | 'name')[];
    latestOutcome: ApplicationOutcome;
    stats: DriverStats;
    applications: DriverApplication[];
}

export interface DriversFilters {
    search: string;
    phoneNumber?: string;
    email?: string;
}

export interface DriverSearchResponse {
    profiles: DriverProfile[];
    total: number;
    truncated: boolean;
    snapshot: {
        fetchedAt: string;
        itemCount: number;
        boardCount: number;
        failedBoards: { boardId: string; error: string }[];
    };
}
