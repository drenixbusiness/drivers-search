import React from 'react';
import {Layout} from 'antd';

import {Content} from "antd/es/layout/layout";
import Sidebar from "@/components/layout/sidebar";
import TopNavbar from "@/components/layout/topNavbar";


export default function DashboardLayout({children}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Layout style={{minHeight: '100vh'}} hasSider>
          <Sidebar width={250} style={{
              position: 'fixed', insetInlineStart: 0, top: 0, bottom: 0,
          }} />
          <Layout style={{ backgroundColor: '#EFF3FD', marginInlineStart: 250 }}>
              <TopNavbar style={{ background: 'transparent', padding: '0 24px' }} />
            <Content style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Content>
          </Layout>
      </Layout>
    </>
  )
}
