'use client'

import {useCallback, useEffect, useState} from "react";
import {Badge, Button, Empty, List, Popover, Space, Spin, Typography} from "antd";
import {
    BellOutlined,
    CheckCircleFilled,
    ExclamationCircleFilled,
    InfoCircleFilled,
} from '@ant-design/icons';
import {AppNotification, NotificationLevel, NotificationsResponse} from "@/models/notification";

const {Text} = Typography;

const STORAGE_KEY = 'drenix.readNotifications';
/** The snapshot only changes when the boards are re-pulled, so a slow poll is enough. */
const POLL_MS = 60_000;

const LEVEL_ICON: Record<NotificationLevel, React.ReactNode> = {
    success: <CheckCircleFilled style={{color: '#52c41a'}}/>,
    warning: <ExclamationCircleFilled style={{color: '#faad14'}}/>,
    info: <InfoCircleFilled style={{color: '#1677ff'}}/>,
};

function readIdsFromStorage(): string[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

function formatTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

export default function NotificationsBell() {
    const [items, setItems] = useState<AppNotification[]>([]);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setReadIds(readIdsFromStorage());
    }, []);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) return;
            const body = (await res.json()) as NotificationsResponse;
            setItems(body.notifications);
        } catch {
            // The bell is not worth surfacing an error for.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, POLL_MS);
        return () => clearInterval(timer);
    }, [load]);

    const persistRead = (ids: string[]) => {
        setReadIds(ids);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch {
            // Private mode / storage disabled — the badge just resets on reload.
        }
    };

    const markAllRead = () => {
        persistRead(Array.from(new Set([...readIds, ...items.map((i) => i.id)])));
    };

    const unread = items.filter((item) => !readIds.includes(item.id));

    // Opening the panel is the "I have seen these" signal, like any mail client.
    const onOpenChange = (next: boolean) => {
        setOpen(next);
        if (next && unread.length) markAllRead();
    };

    const content = (
        <div style={{width: 340, maxWidth: 'calc(100vw - 48px)'}}>
            <Space style={{justifyContent: 'space-between', width: '100%', marginBottom: 8}}>
                <Text strong>Notifications</Text>
                {items.length > 0 && (
                    <Button type="link" size="small" onClick={markAllRead} disabled={!unread.length}>
                        Mark all as read
                    </Button>
                )}
            </Space>

            {loading && !items.length ? (
                <div style={{padding: 24, textAlign: 'center'}}><Spin/></div>
            ) : items.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing to report"/>
            ) : (
                <List
                    size="small"
                    dataSource={items}
                    style={{maxHeight: 360, overflowY: 'auto'}}
                    renderItem={(item) => (
                        <List.Item style={{alignItems: 'flex-start'}}>
                            <List.Item.Meta
                                avatar={LEVEL_ICON[item.level]}
                                title={<span style={{fontSize: 13}}>{item.title}</span>}
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{fontSize: 12}}>{item.description}</Text>
                                        <Text type="secondary" style={{fontSize: 11}}>{formatTime(item.createdAt)}</Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            placement="bottomRight"
            open={open}
            onOpenChange={onOpenChange}
        >
            <Badge count={unread.length} size="small" offset={[-4, 4]}>
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Notifications"
                    style={{
                        width: 44, height: 44,
                        display: 'grid', placeItems: 'center',
                        background: '#fff', borderRadius: 12,
                        boxShadow: '0px 2px 8px rgba(17,24,39,0.04)',
                        cursor: 'pointer',
                    }}
                >
                    <BellOutlined style={{fontSize: 18, color: '#F5C518'}}/>
                </div>
            </Badge>
        </Popover>
    );
}
