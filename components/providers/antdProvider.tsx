'use client'

import React from "react";
import {App as AntApp, ConfigProvider} from "antd";
import {AntdRegistry} from "@ant-design/nextjs-registry";

/** Wires up antd's SSR style registry and the App context (message, modal, notification). */
export default function AntdProvider({children}: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider theme={{token: {borderRadius: 12}}}>
                <AntApp>{children}</AntApp>
            </ConfigProvider>
        </AntdRegistry>
    );
}
