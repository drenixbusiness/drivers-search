'use client'

import {Card, Col, Collapse, Descriptions, Empty, Modal, Row, Space, Tabs, Tag, Timeline, Typography} from "antd";
import {LinkOutlined} from '@ant-design/icons';
import {DriverProfile} from "@/models/driver";
import OutcomeTag, {OUTCOME_META} from "@/components/drivers/outcomeTag";
import {formatDate} from "@/components/tables/basicTable";

const {Text} = Typography;

interface DriverProfileModalProps {
    profile: DriverProfile | null;
    open: boolean;
    onClose: () => void;
}

/** Small labelled number used in the summary strip. */
function Stat({label, value, color}: { label: string; value: number; color?: string }) {
    return (
        <Card size="small" style={{borderRadius: 12, textAlign: 'center'}} styles={{body: {padding: '10px 8px'}}}>
            <div style={{fontSize: 22, fontWeight: 700, lineHeight: 1.2, color}}>{value}</div>
            <Text type="secondary" style={{fontSize: 12}}>{label}</Text>
        </Card>
    );
}

/** A list of contact values, each one copyable. */
function CopyList({values}: { values: string[] }) {
    if (!values.length) return <>—</>;
    return (
        <Space direction="vertical" size={2}>
            {values.map((value) => (
                <Text key={value} copyable={{text: value}}>{value}</Text>
            ))}
        </Space>
    );
}

export default function DriverProfileModal({profile, open, onClose}: DriverProfileModalProps) {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={880}
            style={{top: 24, maxWidth: 'calc(100vw - 32px)'}}
            styles={{body: {maxHeight: '72vh', overflowY: 'auto', paddingInlineEnd: 8}}}
            destroyOnClose
            title={
                profile && (
                    <Space size={8} wrap>
                        <span>{profile.fullName}</span>
                        <OutcomeTag outcome={profile.latestOutcome}/>
                        {profile.stats.isRepeatApplicant && (
                            <Tag color="gold">Repeat applicant · {profile.stats.totalApplications}x</Tag>
                        )}
                    </Space>
                )
            }
        >
            {!profile ? (
                <Empty description="No driver selected"/>
            ) : (
                <Space direction="vertical" size={20} style={{width: '100%'}}>
                    <Row gutter={[12, 12]}>
                        <Col xs={8} md={4}><Stat label="Applications" value={profile.stats.totalApplications}/></Col>
                        <Col xs={8} md={4}><Stat label="Boards" value={profile.stats.boardsCount}/></Col>
                        <Col xs={8} md={4}><Stat label="Hired" value={profile.stats.hiredCount} color="#389e0d"/></Col>
                        <Col xs={8} md={4}><Stat label="Rejected" value={profile.stats.rejectedCount} color="#cf1322"/></Col>
                        <Col xs={8} md={4}><Stat label="Terminated" value={profile.stats.terminatedCount} color="#d4380d"/></Col>
                        <Col xs={8} md={4}><Stat label="In progress" value={profile.stats.inProgressCount} color="#1677ff"/></Col>
                    </Row>

                    <Descriptions column={{xs: 1, sm: 1, md: 2}} size="small" bordered>
                        <Descriptions.Item label="Phones"><CopyList values={profile.phones}/></Descriptions.Item>
                        <Descriptions.Item label="Emails"><CopyList values={profile.emails}/></Descriptions.Item>
                        <Descriptions.Item label="Companies">{profile.companies.join(', ') || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Other names">
                            {profile.aliases.length ? profile.aliases.join(', ') : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="First seen">{formatDate(profile.stats.firstSeenAt)}</Descriptions.Item>
                        <Descriptions.Item label="Last seen">{formatDate(profile.stats.lastSeenAt)}</Descriptions.Item>
                        <Descriptions.Item label="Records merged by">
                            {profile.linkedBy.length
                                ? profile.linkedBy.map((via) => <Tag key={via}>{via}</Tag>)
                                : 'single record'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Tabs
                        defaultActiveKey="timeline"
                        items={[
                            {
                                key: 'timeline',
                                label: `History (${profile.applications.length})`,
                                children: (
                                    <Timeline
                                        items={profile.applications.map((app) => ({
                                            color: OUTCOME_META[app.outcome].color === 'default'
                                                ? 'gray'
                                                : OUTCOME_META[app.outcome].color,
                                            children: (
                                                <Space direction="vertical" size={2}>
                                                    <Space size={8} wrap>
                                                        <span className="font-medium">{app.boardName}</span>
                                                        <OutcomeTag outcome={app.outcome}/>
                                                    </Space>
                                                    <Text type="secondary" style={{fontSize: 12}}>
                                                        {formatDate(app.createdAt)}
                                                        {app.groupName ? ` · ${app.groupName}` : ''}
                                                        {app.status ? ` · ${app.status}` : ''}
                                                    </Text>
                                                    {app.notes.map((note) => (
                                                        <Text
                                                            key={note.id}
                                                            style={{fontSize: 12, whiteSpace: 'pre-wrap'}}
                                                        >
                                                            {note.title}: {note.value}
                                                        </Text>
                                                    ))}
                                                </Space>
                                            ),
                                        }))}
                                    />
                                ),
                            },
                            {
                                key: 'records',
                                label: 'Raw records',
                                children: (
                                    <Collapse
                                        items={profile.applications.map((app) => ({
                                            key: `${app.boardId}-${app.itemId}`,
                                            label: (
                                                <Space size={8} wrap>
                                                    <span>{app.boardName}</span>
                                                    <Text type="secondary" style={{fontSize: 12}}>
                                                        {formatDate(app.createdAt)}
                                                    </Text>
                                                    <OutcomeTag outcome={app.outcome}/>
                                                </Space>
                                            ),
                                            extra: (
                                                <a
                                                    href={app.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <LinkOutlined/>
                                                </a>
                                            ),
                                            children: (
                                                <Descriptions column={1} size="small" bordered>
                                                    {app.fields.map((field) => (
                                                        <Descriptions.Item key={field.id} label={field.title}>
                                                            {field.value}
                                                        </Descriptions.Item>
                                                    ))}
                                                </Descriptions>
                                            ),
                                        }))}
                                    />
                                ),
                            },
                        ]}
                    />
                </Space>
            )}
        </Modal>
    );
}
