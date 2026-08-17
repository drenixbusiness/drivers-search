'use client'

import {Collapse, Descriptions, Drawer, Empty, Space, Statistic, Tag, Timeline, Typography} from "antd";
import {LinkOutlined} from '@ant-design/icons';
import {DriverProfile} from "@/models/driver";
import OutcomeTag, {OUTCOME_META} from "@/components/drivers/outcomeTag";
import {formatDate} from "@/components/tables/basicTable";

const {Text, Title} = Typography;

interface DriverDetailDrawerProps {
    profile: DriverProfile | null;
    open: boolean;
    onClose: () => void;
}

export default function DriverDetailDrawer({profile, open, onClose}: DriverDetailDrawerProps) {
    return (
        <Drawer
            width={720}
            open={open}
            onClose={onClose}
            title={profile?.fullName ?? 'Driver'}
            destroyOnClose
        >
            {!profile ? (
                <Empty description="No driver selected"/>
            ) : (
                <Space direction="vertical" size={24} style={{width: '100%'}}>
                    <Space size={40} wrap>
                        <Statistic title="Applications" value={profile.stats.totalApplications}/>
                        <Statistic title="Boards" value={profile.stats.boardsCount}/>
                        <Statistic title="Rejected" value={profile.stats.rejectedCount}/>
                        <Statistic title="Hired" value={profile.stats.hiredCount}/>
                        <Statistic title="Terminated" value={profile.stats.terminatedCount}/>
                    </Space>

                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Names">
                            {[profile.fullName, ...profile.aliases].join(', ')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phones">
                            {profile.phones.join(', ') || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Emails">
                            {profile.emails.join(', ') || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Companies">
                            {profile.companies.join(', ') || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="First / last seen">
                            {formatDate(profile.stats.firstSeenAt)} — {formatDate(profile.stats.lastSeenAt)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Records merged by">
                            {profile.linkedBy.length
                                ? profile.linkedBy.map((via) => <Tag key={via}>{via}</Tag>)
                                : 'single record'}
                        </Descriptions.Item>
                    </Descriptions>

                    <div>
                        <Title level={5}>Timeline</Title>
                        <Timeline
                            items={profile.applications.map((app) => ({
                                color: OUTCOME_META[app.outcome].color === 'default'
                                    ? 'gray'
                                    : OUTCOME_META[app.outcome].color,
                                children: (
                                    <Space direction="vertical" size={0}>
                                        <Space size={8} wrap>
                                            <span className="font-medium">{app.boardName}</span>
                                            <OutcomeTag outcome={app.outcome}/>
                                        </Space>
                                        <Text type="secondary" style={{fontSize: 12}}>
                                            {formatDate(app.createdAt)}
                                            {app.groupName ? ` · ${app.groupName}` : ''}
                                            {app.status ? ` · ${app.status}` : ''}
                                        </Text>
                                    </Space>
                                ),
                            }))}
                        />
                    </div>

                    <div>
                        <Title level={5}>Raw records</Title>
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
                    </div>
                </Space>
            )}
        </Drawer>
    );
}
