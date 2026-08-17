'use client'

import {Avatar, Badge, Layout, Space} from "antd";
import { BellOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface TopNavbarProps {
    style?: { background: string; padding: string };
    userName?: string;
    avatar?: string;
}

export default function TopNavbar({
                                      userName='Asilbek',
                                      avatar='images/avatar.png',
                                      style,
}: TopNavbarProps) {
    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                height: 64,
                padding: '0 24px',
                background: 'transparent',
                lineHeight: 'normal',
                ...style,
            }}
        >
            <h2 className="m-0 text-2xl font-bold whitespace-nowrap"> Hello {userName}</h2>
            <Space size={16} align="center">
                <Badge dot color="red" offset={[-4, 4]}>
                <div
                    style={{
                        width: 44, height: 44,
                        display: 'grid', placeItems: 'center',
                        background: '#fff', borderRadius: 12,
                        boxShadow: '0px 2px 8px rgba(17,24,39,0.04)',
                        cursor: 'pointer',
                    }}

                >
                    <BellOutlined style={{ fontSize: 18, color: '#F5C518' }} />
                </div>
                </Badge>

                <Space size={12} align="center" style={{cursor:"pointer"}}>
                    <span className="font-medium whitespace-nowrap">{userName}</span>
                    <Avatar src={avatar} alt="avatar" size={44} shape="square" style={{ borderRadius: 12}} />
                </Space>
            </Space>

        </Header>
    )
}