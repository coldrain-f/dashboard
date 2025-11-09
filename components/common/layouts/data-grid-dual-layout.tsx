// components/layouts/dual-grid-layout.tsx
'use client';

import { ReactNode } from 'react';

interface DualGridDualLayoutProps {
    children: [ReactNode, ReactNode];
    gridRatio?: string;
}

export default function DualGridLayout({
    children,
    gridRatio = '2fr 3fr'
}: DualGridDualLayoutProps) {
    const [left, right] = children;

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="py-6">
                    <div className="px-4 lg:px-6">
                        <div className="grid gap-5" style={{
                            gridTemplateColumns: gridRatio
                        }}>
                            {left}
                            {right}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}