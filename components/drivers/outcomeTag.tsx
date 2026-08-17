'use client'

import {Tag} from "antd";
import {ApplicationOutcome} from "@/models/driver";

export const OUTCOME_META: Record<ApplicationOutcome, { label: string; color: string }> = {
    hired: {label: 'Hired', color: 'green'},
    rejected: {label: 'Rejected', color: 'red'},
    terminated: {label: 'Terminated', color: 'volcano'},
    in_progress: {label: 'In progress', color: 'blue'},
    unknown: {label: 'Unknown', color: 'default'},
};

export default function OutcomeTag({outcome, count}: { outcome: ApplicationOutcome; count?: number }) {
    const meta = OUTCOME_META[outcome];
    return (
        <Tag color={meta.color} style={{marginInlineEnd: 4}}>
            {meta.label}{count !== undefined ? ` · ${count}` : ''}
        </Tag>
    );
}
