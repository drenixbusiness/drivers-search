'use client'

import React, {useState} from 'react';
import {Drawer, Layout} from 'antd';
import {Content} from "antd/es/layout/layout";
import Sidebar, {SidebarContent} from "@/components/layout/sidebar";
import TopNavbar from "@/components/layout/topNavbar";
import {useIsMobile} from "@/lib/hooks/useMediaQuery";

const SIDEBAR_WIDTH = 250;

export default function DashboardLayout({children}: {
    children: React.ReactNode
}) {
    const isMobile = useIsMobile();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <Layout style={{minHeight: '100vh', background: '#EFF3FD'}} hasSider={!isMobile}>
            {/* Desktop: always-visible sidebar. Mobile: it slides in over the page. */}
            {!isMobile && <Sidebar width={SIDEBAR_WIDTH}/>}

            <Drawer
                placement="left"
                width={SIDEBAR_WIDTH}
                open={isMobile && drawerOpen}
                onClose={() => setDrawerOpen(false)}
                closable={false}
                styles={{body: {padding: 0}, header: {display: 'none'}}}
            >
                <SidebarContent onNavigate={() => setDrawerOpen(false)}/>
            </Drawer>

            {/* minWidth:0 stops a wide table from pushing the whole page sideways. */}
            <Layout style={{background: '#EFF3FD', minWidth: 0}}>
                <TopNavbar
                    onToggleMenu={isMobile ? () => setDrawerOpen((open) => !open) : undefined}
                    menuCollapsed={!drawerOpen}
                />
                <Content className="p-4 md:p-6" style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
