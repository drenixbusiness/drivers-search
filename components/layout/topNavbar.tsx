'use client'

import {CSSProperties, useState} from "react";
import {Avatar, Button, Layout, Space} from "antd";
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import {CURRENT_USER} from "@/lib/config/currentUser";
import UserProfileModal from "@/components/layout/userProfileModal";
import NotificationsBell from "@/components/layout/notificationsBell";

const {Header} = Layout;

interface TopNavbarProps {
    style?: CSSProperties;
    userName?: string;
    avatar?: string;
    /** Opens the mobile drawer. Omitted on desktop, where the sidebar is always visible. */
    onToggleMenu?: () => void;
    menuCollapsed?: boolean;
}

export default function TopNavbar({
                                      userName,
                                      avatar,
                                      style,
                                      onToggleMenu,
                                      menuCollapsed = false,
                                  }: TopNavbarProps) {
    const [profileOpen, setProfileOpen] = useState(false);

    // Props win over the configured user, so the navbar can still be reused elsewhere.
    const user = {
        ...CURRENT_USER,
        ...(userName ? {name: userName} : {}),
        ...(avatar ? {avatar} : {}),
    };

    return (
        <Header
            className="px-4 md:px-6"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                height: 64,
                background: 'transparent',
                lineHeight: 'normal',
                ...style,
            }}
        >
            <Space size={12} align="center" style={{minWidth: 0}}>
                {onToggleMenu && (
                    <Button
                        type="text"
                        aria-label="Toggle menu"
                        icon={menuCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={onToggleMenu}
                        style={{fontSize: 18}}
                    />
                )}
                <h2 className="m-0 truncate text-lg sm:text-2xl font-bold">Hello {user.name}</h2>
            </Space>

            <Space size={12} align="center">
                <NotificationsBell/>

                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Open my profile"
                    onClick={() => setProfileOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setProfileOpen(true);
                    }}
                    style={{display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'}}
                >
                    <span className="hidden sm:inline font-medium whitespace-nowrap">{user.name}</span>
                    <Avatar src={user.avatar} alt="avatar" size={44} shape="square" style={{borderRadius: 12}}/>
                </div>
            </Space>

            <UserProfileModal user={user} open={profileOpen} onClose={() => setProfileOpen(false)}/>
        </Header>
    );
}
