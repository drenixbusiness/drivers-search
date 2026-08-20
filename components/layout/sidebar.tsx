'use client'

import {AppstoreOutlined, UserOutlined} from '@ant-design/icons';
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Layout, Menu} from "antd";

const {Sider} = Layout;

const items = [
    {key: '/dashboard', icon: <AppstoreOutlined/>, label: <Link href="/dashboard">Dashboard</Link>},
    {key: '/drivers-checking', icon: <UserOutlined/>, label: <Link href="/drivers-checking">Drivers Checking</Link>},
];

function useSelectedKeys() {
    const pathname = usePathname();
    return items
        .map((i) => i.key)
        .filter((key) => pathname === key || pathname.startsWith(key + '/'))
        .sort((a, b) => b.length - a.length)
        .slice(0, 1);
}

/**
 * Logo + navigation. Shared by the desktop Sider and the mobile Drawer, so both
 * always show the same menu.
 */
export function SidebarContent({onNavigate}: { onNavigate?: () => void }) {
    const selected = useSelectedKeys();

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <div className="flex flex-row items-center gap-2 p-4" style={{height: 64, overflow: 'hidden'}}>
                <img src="/images/logo-rm.png" alt="logo" width={40} height={40} style={{flexShrink: 0}}/>
                <span className="text-2xl uppercase font-black whitespace-nowrap">Drenix</span>
            </div>

            <Menu
                mode="inline"
                items={items}
                selectedKeys={selected}
                onClick={onNavigate}
                style={{borderInlineEnd: 0, flex: 1, fontSize: 16}}
            />
        </div>
    );
}

interface SidebarProps {
    width?: number;
}

/**
 * Desktop sidebar. It stays in the normal flex flow (sticky, not fixed) so the
 * content next to it reflows on its own — no margin math.
 */
export default function Sidebar({width = 250}: SidebarProps) {
    return (
        <Sider
            theme="light"
            width={width}
            style={{
                position: 'sticky',
                insetInlineStart: 0,
                top: 0,
                height: '100vh',
                overflow: 'auto',
                borderInlineEnd: '1px solid #f0f0f0',
                background: '#fff',
            }}
        >
            <SidebarContent/>
        </Sider>
    );
}
