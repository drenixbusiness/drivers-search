import type {Metadata} from "next";
import {Inter} from "next/font/google";
import AntdProvider from "@/components/providers/antdProvider";
import "@/styles/app.scss";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Drenix — Driver Database",
    description: "Search and analyse driver history across every Monday board",
};

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AntdProvider>{children}</AntdProvider>
        </body>
        </html>
    );
}
