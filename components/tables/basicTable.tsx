'use client'

import React, {useState} from "react";
import {Alert, Badge, Button, Card, Empty, Space, Table, TableProps, Tag, Tooltip, Typography} from "antd";
import {EyeOutlined, MessageOutlined, SearchOutlined, WarningOutlined} from '@ant-design/icons';
import {DriverApplication, DriverProfile} from "@/models/driver";
import OutcomeTag from "@/components/drivers/outcomeTag";
import CommentsModal from "@/components/drivers/commentsModal";

const {Text} = Typography;

interface BasicTableProps {
    data: DriverProfile[];
    loading?: boolean;
    /** False until the user actually runs a search — drives the empty state. */
    searched?: boolean;
    error?: string | null;
    onView?: (row: DriverProfile) => void;
}

export function formatDate(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

/** The history of one driver: every board row that belongs to them. */
function ApplicationHistory({profile}: { profile: DriverProfile }) {
    const [comments, setComments] = useState<DriverApplication | null>(null);

    const columns: TableProps<DriverApplication>['columns'] = [
        {title: 'Board', dataIndex: 'boardName', key: 'boardName'},
        {title: 'Group', dataIndex: 'groupName', key: 'groupName', render: (v: string) => v || '—'},
        {title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => v || '—'},
        {
            title: 'Outcome',
            dataIndex: 'outcome',
            key: 'outcome',
            render: (outcome: DriverApplication['outcome']) => <OutcomeTag outcome={outcome}/>,
        },
        {
            title: 'Applied',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string | null) => formatDate(v),
        },
        {
            title: '',
            key: 'comments',
            width: 140,
            render: (_, row) => (
                <Badge count={row.notes.length} size="small" offset={[-4, 2]}>
                    <Button
                        size="small"
                        icon={<MessageOutlined/>}
                        onClick={() => setComments(row)}
                    >
                        Comments
                    </Button>
                </Badge>
            ),
        },
    ];

    return (
        <>
            <Table<DriverApplication>
                size="small"
                rowKey={(row) => `${row.boardId}-${row.itemId}`}
                columns={columns}
                dataSource={profile.applications}
                pagination={false}
            />
            <CommentsModal
                application={comments}
                open={Boolean(comments)}
                onClose={() => setComments(null)}
            />
        </>
    );
}

export default function BasicTable({data, loading, searched, error, onView}: BasicTableProps) {
    const columns: TableProps<DriverProfile>['columns'] = [
        {
            title: 'Driver',
            dataIndex: 'fullName',
            key: 'fullName',
            fixed: 'left',
            width: 220,
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
            render: (name: string, row) => (
                <Space direction="vertical" size={0}>
                    <span className="font-medium">{name}</span>
                    {row.aliases.length > 0 && (
                        <Text type="secondary" style={{fontSize: 12}}>
                            also: {row.aliases.join(', ')}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phones',
            key: 'phones',
            render: (phones: string[]) => (
                <Space direction="vertical" size={0}>
                    {phones.length ? phones.map((p) => <span key={p}>{p}</span>) : '—'}
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'emails',
            key: 'emails',
            ellipsis: true,
            render: (emails: string[]) => (
                <Space direction="vertical" size={0}>
                    {emails.length ? emails.map((e) => <span key={e}>{e}</span>) : '—'}
                </Space>
            ),
        },
        {
            title: 'Company',
            dataIndex: 'companies',
            key: 'companies',
            render: (companies: string[]) => companies.join(', ') || '—',
        },
        {
            title: 'Applications',
            key: 'applications',
            width: 130,
            sorter: (a, b) => a.stats.totalApplications - b.stats.totalApplications,
            defaultSortOrder: 'descend',
            render: (_, row) => (
                <Space size={4}>
                    <Tag color={row.stats.isRepeatApplicant ? 'gold' : 'default'}>
                        {row.stats.totalApplications}x
                    </Tag>
                    <Text type="secondary" style={{fontSize: 12}}>
                        {row.stats.boardsCount} board{row.stats.boardsCount === 1 ? '' : 's'}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'History',
            key: 'history',
            width: 230,
            render: (_, row) => (
                <Space size={0} wrap>
                    {row.stats.hiredCount > 0 && <OutcomeTag outcome="hired" count={row.stats.hiredCount}/>}
                    {row.stats.rejectedCount > 0 && <OutcomeTag outcome="rejected" count={row.stats.rejectedCount}/>}
                    {row.stats.terminatedCount > 0 &&
                        <OutcomeTag outcome="terminated" count={row.stats.terminatedCount}/>}
                    {row.stats.inProgressCount > 0 &&
                        <OutcomeTag outcome="in_progress" count={row.stats.inProgressCount}/>}
                </Space>
            ),
        },
        {
            title: 'Last status',
            key: 'latestOutcome',
            width: 130,
            render: (_, row) => <OutcomeTag outcome={row.latestOutcome}/>,
        },
        {
            title: 'First seen',
            key: 'firstSeenAt',
            width: 120,
            render: (_, row) => formatDate(row.stats.firstSeenAt),
        },
        {
            title: 'Last seen',
            key: 'lastSeenAt',
            width: 120,
            render: (_, row) => formatDate(row.stats.lastSeenAt),
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            fixed: 'right',
            render: (_, row) => (
                <Tooltip title="Open full record">
                    <Button type="text" icon={<EyeOutlined/>} onClick={() => onView?.(row)}/>
                </Tooltip>
            ),
        },
    ];

    const emptyState = searched ? (
        <Empty description="No driver matched this search."/>
    ) : (
        <Empty
            image={<SearchOutlined style={{fontSize: 48, color: '#B4BCCC'}}/>}
            imageStyle={{height: 60, display: 'grid', placeItems: 'center'}}
            description={
                <Space direction="vertical" size={4}>
                    <span className="font-medium">Type what you are looking for</span>
                    <Text type="secondary">
                        Search a driver by name, phone number or email to load their record from Monday.
                    </Text>
                </Space>
            }
        />
    );

    return (
        <Card>
            {error && (
                <Alert
                    type="error"
                    icon={<WarningOutlined/>}
                    showIcon
                    message="Could not load drivers from Monday"
                    description={error}
                    style={{marginBottom: 16}}
                />
            )}
            <Table<DriverProfile>
                rowKey="key"
                columns={columns}
                dataSource={data}
                loading={loading}
                scroll={{x: 1400}}
                locale={{emptyText: emptyState}}
                expandable={{
                    expandedRowRender: (row) => <ApplicationHistory profile={row}/>,
                    rowExpandable: (row) => row.applications.length > 0,
                }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (t) => `${t} driver${t === 1 ? '' : 's'}`,
                }}
            />
        </Card>
    );
}
