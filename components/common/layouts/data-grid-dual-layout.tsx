'use client';

import { ReactNode } from 'react';

const GRID_RATIOS = {
    EQUAL: '1fr 1fr',              // 균등 분할
    SIDEBAR_LEFT: '1fr 3fr',       // 왼쪽 사이드바 (작음)
    SIDEBAR_RIGHT: '3fr 1fr',      // 오른쪽 사이드바 (작음)
    LEFT_EMPHASIS: '2fr 3fr',      // 왼쪽 약간 작게
    RIGHT_EMPHASIS: '3fr 2fr',     // 오른쪽 약간 작게
    MASTER_DETAIL: '1fr 2fr',      // 마스터-디테일 (왼쪽 목록, 오른쪽 상세)
} as const;

type GridRatio = typeof GRID_RATIOS[keyof typeof GRID_RATIOS] | string;

interface DualGridDualLayoutProps {
    children: [ReactNode, ReactNode];
    gridRatio?: GridRatio;
}

export default function DataGridDualLayout({
    children,
    gridRatio = GRID_RATIOS.LEFT_EMPHASIS
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

export { GRID_RATIOS };