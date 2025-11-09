// components/layouts/admin-page-layout.tsx
'use client';

import { ReactNode } from 'react';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { Separator } from '@/components/ui/separator';

interface MainLayoutProps {
    children: ReactNode;
    title: string;
}

export default function MainLayout({ children, title = "제목" }: MainLayoutProps) {
    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
            className="theme-scaled"
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />

                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="py-6">
                            <div className="px-4 lg:px-6 ">
                                <div className="mb-4">
                                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                        {title}
                                    </h4>
                                </div>
                                <Separator className="mb-4" />
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}