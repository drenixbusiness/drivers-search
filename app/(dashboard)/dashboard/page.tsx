'use client'

import React, {useCallback, useEffect, useState} from "react";
import {Alert, Button, Card, Col, Progress, Row, Space, Spin, Statistic, Table, Typography} from "antd";
import {SyncOutlined} from '@ant-design/icons';
import Link from "next/link";
import {ApplicationOutcome} from "@/models/driver";
import {OUTCOME_META} from "@/components/drivers/outcomeTag";

const {Text, Title} = Typography;

interface DriversOverview {
    totalRecords: number;
    totalDrivers: number;
    repeatApplicants: number;
    rejectedDrivers: number;
    hiredDrivers: number;
    terminatedDrivers: number;
    reappliedAfterRejection: number;
    topBoards: { boardId: string; boardName: string; records: number }[];
    outcomeBreakdown: { outcome: ApplicationOutcome; records: number }[];
    snapshot: {
        fetchedAt: string;
        boardCount: number;
        failedBoards: { boardId: string; error: string }[];
    };
}

export default function Dashboard() {
    const [data, setData] = useState<DriversOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (refresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/drivers/overview${refresh ? '?refresh=1' : ''}`);
            const body = await res.json();
            if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
            setData(body as DriversOverview);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unexpected error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const cardStyle = {borderRadius: 16, border: 'none'} as const;
    const maxBoardRecords = data?.topBoards[0]?.records ?? 0;

    return (
        <Space direction="vertical" size={24} style={{width: '100%'}}>
            <Row align="middle" justify="space-between" gutter={[16, 16]}>
                <Col>
                    <Title level={3} style={{margin: 0}}>Driver database overview</Title>
                    <Text type="secondary">
                        {data
                            ? `${data.snapshot.boardCount} Monday boards · synced ${new Date(data.snapshot.fetchedAt).toLocaleString()}`
                            : 'Loading data from Monday…'}
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Link href="/drivers-checking">
                            <Button type="primary">Driver search</Button>
                        </Link>
                        <Button icon={<SyncOutlined/>} onClick={() => load(true)} disabled={loading}>
                            Refresh
                        </Button>
                    </Space>
                </Col>
            </Row>

            {error && (
                <Alert
                    type="error"
                    showIcon
                    message="Could not load the overview"
                    description={error}
                />
            )}

            {data && data.snapshot.failedBoards.length > 0 && (
                <Alert
                    type="warning"
                    showIcon
                    message={`${data.snapshot.failedBoards.length} board(s) could not be read`}
                    description={data.snapshot.failedBoards
                        .map((b) => `${b.boardId}: ${b.error}`)
                        .join(' | ')}
                />
            )}

            <Spin spinning={loading && !data}>
                <Row gutter={[16, 16]}>
                    {[
                        {title: 'Unique drivers', value: data?.totalDrivers},
                        {title: 'Total records', value: data?.totalRecords},
                        {title: 'Repeat applicants', value: data?.repeatApplicants},
                        {title: 'Rejected at least once', value: data?.rejectedDrivers},
                        {title: 'Hired at least once', value: data?.hiredDrivers},
                        {title: 'Re-applied after rejection', value: data?.reappliedAfterRejection},
                    ].map((item) => (
                        <Col xs={12} md={8} xl={4} key={item.title}>
                            <Card style={cardStyle} styles={{body: {padding: 20}}}>
                                <Statistic title={item.title} value={item.value ?? 0}/>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Spin>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Records by outcome" style={cardStyle} loading={loading && !data}>
                        <Space direction="vertical" size={12} style={{width: '100%'}}>
                            {data?.outcomeBreakdown.map((row) => (
                                <div key={row.outcome}>
                                    <Space style={{justifyContent: 'space-between', width: '100%'}}>
                                        <Text>{OUTCOME_META[row.outcome].label}</Text>
                                        <Text type="secondary">{row.records}</Text>
                                    </Space>
                                    <Progress
                                        percent={data.totalRecords
                                            ? Math.round((row.records / data.totalRecords) * 100)
                                            : 0}
                                        showInfo={false}
                                        strokeColor={OUTCOME_META[row.outcome].color === 'default'
                                            ? '#B4BCCC'
                                            : undefined}
                                    />
                                </div>
                            ))}
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Biggest boards" style={cardStyle} loading={loading && !data}>
                        <Table
                            size="small"
                            rowKey="boardId"
                            pagination={false}
                            dataSource={data?.topBoards ?? []}
                            columns={[
                                {title: 'Board', dataIndex: 'boardName', key: 'boardName'},
                                {
                                    title: 'Records',
                                    dataIndex: 'records',
                                    key: 'records',
                                    width: 200,
                                    render: (records: number) => (
                                        <Space style={{width: '100%'}}>
                                            <Progress
                                                percent={maxBoardRecords
                                                    ? Math.round((records / maxBoardRecords) * 100)
                                                    : 0}
                                                showInfo={false}
                                                style={{width: 120}}
                                            />
                                            <Text type="secondary">{records}</Text>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}
