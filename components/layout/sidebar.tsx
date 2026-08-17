'use client'

import {
    AppstoreOutlined,
    UserOutlined
} from '@ant-design/icons';
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Layout, Menu} from "antd";



interface SidebarProps {
    width?: number,
    style?: { position: string; insetInlineStart: number; top: number; bottom: number }
}

const { Sider } = Layout;
const items = [
    { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
    { key: '/drivers-checking', icon: <UserOutlined />, label: <Link href="/drivers-checking">Drivers Checking</Link> },
]


export default function Sidebar({width, style}: SidebarProps) {
    const pathname = usePathname();
    const selected = items
        .map((i) => i.key)
        .filter((key) => pathname === key || pathname.startsWith(key + '/'))
        .sort((a, b) => b.length - a.length)
        .slice(0, 1);

    return (
        <Sider
            width={250}
            breakpoint="lg"
            collapsedWidth={0}
            style={{
                position: 'fixed',
                insetInlineStart: 0,
                top: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
                borderInlineEnd: '1px solid #f0f0f0',
                backgroundColor: '#fff',
            }}
        >
            <div className="flex flex-row gap-2 w-full p-4 items-center">
                <img src="/images/logo-rm.png" alt="logo" width={40} />
                <span className="text-2xl uppercase font-black">Drenix</span>
            </div>

            <Menu
                mode="inline"
                items={items}
                selectedKeys={selected}
                style={{ borderInlineEnd: 0, flex: 1, fontSize: '16px' }}
            />
        </Sider>
    )
}