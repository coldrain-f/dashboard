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
    darkMode?: boolean
}

export function DataGridSearchSection({ fields, onSearch, onReset, darkMode = false }: DataGridSearchSectionProps) {
    return (
        <div className="space-y-3">
            {/* 검색 헤더 */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`h-5 w-1 rounded-full ${darkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
                    <h2 className={`text-lg font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        검색 조건
                    </h2>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={onSearch}
                        size="sm"
                        className={`cursor-pointer gap-2 transition-all duration-200 ${darkMode
                            ? 'bg-white text-slate-900 hover:bg-slate-100'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        조회
                    </Button>
                    <Button
                        onClick={onReset}
                        size="sm"
                        variant="outline"
                        className={`cursor-pointer gap-2 transition-all duration-200 rounded-lg ${darkMode
                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        초기화
                    </Button>
                </div>
            </div>

            {/* 검색 필드 영역 */}
            <div className={`rounded-lg border shadow-sm transition-colors duration-200 ${darkMode
                ? 'bg-slate-900 border-slate-700 shadow-slate-900/50'
                : 'bg-white border-slate-200 shadow-slate-200/50'
                }`}>
                <div className="grid grid-cols-4 gap-x-6 gap-y-4 p-6">
                    {fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Label className={`whitespace-nowrap text-sm font-medium min-w-[80px] ${darkMode
                                ? 'text-slate-300'
                                : 'text-slate-700'
                                }`}>
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