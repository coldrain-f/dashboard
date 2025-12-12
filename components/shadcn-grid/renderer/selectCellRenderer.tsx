import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default (props: CustomCellRendererProps) => {
    // 그룹 행이면 기본 값만 표시
    if (props.node.group) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '42px',
                lineHeight: '42px'
            }}>
                {props.value}
            </div>
        );
    }

    const options = props.colDef?.cellRendererParams?.options || [];
    const handleValueChange = (newValue: string) => {
        // AG Grid 셀 값 업데이트
        props.setValue?.(newValue)
    };

    return (
        <div className="w-full h-full flex items-center" style={{ padding: '0 4px' }}>
            <Select value={props.value} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full h-8 border-none shadow-none bg-transparent focus:ring-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};