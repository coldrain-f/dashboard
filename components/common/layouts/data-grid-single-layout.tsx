'use client';

import { ReactNode } from 'react';

interface DataGridSingleLayoutProps {
    children: ReactNode;
}

export default function DataGridSingleLayout({
    children
}: DataGridSingleLayoutProps) {

    return (
        <div>
            {children}
        </div>
    );
}