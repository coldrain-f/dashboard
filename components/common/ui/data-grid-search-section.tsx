// components/search-section.tsx
"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Search, RotateCcw } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface DataGridSearchField {
    label: string
    component: React.ReactNode
}

interface DataGridSearchSectionProps {
    fields: DataGridSearchField[]
    onSearch: () => void
    onReset: () => void
}

export function DataGridSearchSection({ fields, onSearch, onReset }: DataGridSearchSectionProps) {
    return (
        <div className="mb-6">
            {/* 검색 헤더 */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-[#999999] rounded-full" />
                    <h2 className="text-lg font-semibold text-gray-800">검색 조건</h2>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={onSearch}
                        size="sm"
                        className='cursor-pointer gap-2'
                    >
                        <Search className="w-4 h-4" />
                        조회
                    </Button>
                    <Button
                        onClick={onReset}
                        size="sm"
                        variant="outline"
                        className="cursor-pointer gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 rounded-lg"
                    >
                        <RotateCcw className="w-4 h-4" />
                        초기화
                    </Button>
                </div>
            </div>

            {/* 검색 필드 영역 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="grid grid-cols-4 gap-x-6 gap-y-4 p-6">
                    {fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Label className="whitespace-nowrap text-sm font-medium text-gray-700 min-w-[80px]">
                                {field.label}
                            </Label>
                            <div className="flex-1 min-w-0">
                                {field.component}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}