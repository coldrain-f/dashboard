import React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    // const icon = props.value === 'Male' ? 'fa-male' : 'fa-female';
    return (
        <div className="w-full">
            <Select defaultValue={props.value}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>근로소득</SelectLabel>
                        <SelectItem value="월급">월급</SelectItem>
                        <SelectItem value="보너스">보너스</SelectItem>
                        <SelectItem value="경비">경비</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};