'use client'

import React, {useCallback, useRef, useState} from "react";
import {App as AntApp} from "antd";
import {DriverProfile, DriverSearchResponse, DriversFilters} from "@/models/driver";
import Filters from "@/components/filters/filters";
import BasicTable from "@/components/tables/basicTable";
import DriverDetailDrawer from "@/components/drivers/driverDetailDrawer";

const EMPTY: DriversFilters = {search: '', phoneNumber: '', email: ''};

const hasQuery = (f: DriversFilters) =>
    Boolean(f.search.trim() || f.phoneNumber?.trim() || f.email?.trim());

export default function DriversChecking() {
    const {message} = AntApp.useApp();

    const [filters, setFilters] = useState<DriversFilters>(EMPTY);
    const [profiles, setProfiles] = useState<DriverProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snapshotInfo, setSnapshotInfo] = useState<string>('');
    const [selected, setSelected] = useState<DriverProfile | null>(null);

    // Keeps a slow request from overwriting the result of a newer one.
    const requestId = useRef(0);

    const runSearch = useCallback(
        async (next: DriversFilters, refresh = false) => {
            if (!hasQuery(next)) {
                setProfiles([]);
                setSearched(false);
                setError(null);
                return;
            }

            const id = ++requestId.current;
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (next.search.trim()) params.set('name', next.search.trim());
            if (next.phoneNumber?.trim()) params.set('phone', next.phoneNumber.trim());
            if (next.email?.trim()) params.set('email', next.email.trim());
            if (refresh) params.set('refresh', '1');

            try {
                const res = await fetch(`/api/drivers/search?${params.toString()}`);
                const body = await res.json();
                if (id !== requestId.current) return;

                if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);

                const data = body as DriverSearchResponse;
                setProfiles(data.profiles);
                setSearched(true);

                const fetchedAt = data.snapshot.fetchedAt
                    ? new Date(data.snapshot.fetchedAt).toLocaleString()
                    : '—';
                setSnapshotInfo(
                    `${data.total} driver(s) found · ${data.snapshot.itemCount} records from ` +
                    `${data.snapshot.boardCount} Monday boards · synced ${fetchedAt}`,
                );

                if (data.truncated) {
                    message.warning('Too many matches — showing the first 200. Narrow the search.');
                }
                if (data.snapshot.failedBoards.length) {
                    message.warning(
                        `${data.snapshot.failedBoards.length} board(s) could not be read: ` +
                        data.snapshot.failedBoards.map((b) => b.boardId).join(', '),
                    );
                }
            } catch (e) {
                if (id !== requestId.current) return;
                const text = e instanceof Error ? e.message : 'Unexpected error';
                setError(text);
                setProfiles([]);
                setSearched(true);
            } finally {
                if (id === requestId.current) setLoading(false);
            }
        },
        [message],
    );

    const reset = () => {
        requestId.current++;
        setFilters(EMPTY);
        setProfiles([]);
        setSearched(false);
        setError(null);
        setSnapshotInfo('');
        setLoading(false);
    };

    return (
        <>
            <Filters
                value={filters}
                onChange={setFilters}
                onSearch={() => runSearch(filters)}
                onReset={reset}
                loading={loading}
                snapshotInfo={snapshotInfo}
            />
            <BasicTable
                data={profiles}
                loading={loading}
                searched={searched}
                error={error}
                onView={setSelected}
            />
            <DriverDetailDrawer
                profile={selected}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
