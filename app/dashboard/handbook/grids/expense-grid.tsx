'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SelectionColumnDef, RowSelectionOptions, ColGroupDef } from "ag-grid-community";
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';
import { Button } from '@/components/ui/button';
import { IconDeviceFloppy, IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import CustomLoadingOverlay from "@/components/common/ag-grid/ag-grid-spinner-loading-overlay"
import textCellRenderer from '@/components/shadcn-grid/renderer/textCellRenderer';
import selectCellRenderer from '@/components/shadcn-grid/renderer/selectCellRenderer';

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface IRow {
    description: string;        // 지출내역 (날짜 or 내용)
    amount: number;      // 금액
    category: string;    // 대분류
    subCategory: string; // 소분류
    cardName: string;    // 카드명
    store: string;       // 사용처
}


export default function ExpenseGrid() {
    const grid = useRef<AgGridReact>(null);
    const [darkMode, setDarkMode] = useState(false);

    const [colDefs, setColDefs] = useState<(ColDef<IRow> | ColGroupDef<IRow>)[]>([
        {
            field: 'description',
            headerName: '지출내역',
            // width: 200,
            cellRenderer: textCellRenderer,

        },
        {
            field: 'amount',
            headerName: '금액',
            // width: 150,
            cellRenderer: textCellRenderer,
        },
        {
            field: 'category',
            headerName: '대분류',
            // width: 150,
            cellRenderer: selectCellRenderer,
            cellRendererParams: {
                options: ['식비', '카페/간식', '술/유흥', '생활', '온라인쇼핑', '패션/쇼핑', '뷰티/미용', '교통', '자동차', '주거/통신', '의료/건강', '금융', '문화/여가', '여행/숙박', '교육/학습', '자녀/육아', '반려동물', '경조/선물', '가족/부모'],
            },
        },
        {
            field: 'subCategory',
            headerName: '소분류',
            // width: 150,
            cellRenderer: selectCellRenderer,
            cellRendererParams: {
                options: ['IT', '금융', '제조', "유통", "서비스", "게임", "컨설팅"],
            },
        },
        {
            field: 'cardName',
            headerName: '카드명',
            // width: 150,
            cellRenderer: selectCellRenderer,
            cellRendererParams: {
                options: ['IT', '금융', '제조', "유통", "서비스", "게임", "컨설팅"],
            },
        },
        {
            field: 'store',
            headerName: '사용처',
            // width: 200,
            cellRenderer: selectCellRenderer,
            cellRendererParams: {
                options: ['IT', '금융', '제조', "유통", "서비스", "게임", "컨설팅"],
            },

        },
    ])

    const addRow = () => {
        const newRow: IRow = {
            description: '',
            amount: 0,
            category: '',
            subCategory: '',
            cardName: '',
            store: '',
        };
        grid.current?.api.applyTransaction({ add: [newRow] });
    };



    const [rowData, setRowData] = useState<IRow[]>([]);

    const defaultColDef = useMemo(() => ({
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
        singleClickEdit: false, // 한 번 클릭 편집
        autoHeight: false,
        floatingFilter: false,
        flex: 1,
    }), []);


    // 하단 고정 행
    const pinnedBottomRowData = useMemo(() => {
        const total = rowData.reduce((sum, row) => sum + (row.amount || 0), 0);
        return [{ description: '합계', amount: total, category: '', note: '' }];
    }, [rowData]);

    const selectionColumnDef = useMemo<SelectionColumnDef>(() => {
        return {
            sortable: true,
            resizable: false,
            suppressHeaderMenuButton: true,
            pinned: "left",
            width: 50,
        };
    }, []);

    const rowSelection = useMemo<
        RowSelectionOptions | "single" | "multiple"
    >(() => {
        return { mode: "multiRow" };
    }, []);

    const [loading, setLoading] = useState(true)



    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 200)
    }, [])


    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className={`transition-colors duration-200 ${darkMode ? 'bg-slate-950' : ''}`}>
                <div className="mx-auto space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                지출관리
                            </h1>
                        </div>
                        <div className="flex gap-2 justify-end mb-2">
                            {/* Dark mode toggle */}
                            {darkMode &&
                                <Button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`rounded-lg border transition-all duration-200 ${darkMode
                                        ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    aria-label="다크모드 토글"
                                >
                                    {darkMode ? '☀️' : '🌙'}
                                </Button>
                            }
                            <Button
                                size="sm"
                                className="cursor-pointer gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 rounded-lg"
                                onClick={() => { }}
                            >
                                <IconRefresh />
                                초기화
                            </Button>


                            <Button
                                variant={"outline"}
                                size={"sm"}
                                className="cursor-pointer"
                                onClick={() => { addRow(); }}
                            >
                                <IconPlus />
                                행 추가
                            </Button>


                            <Button
                                variant={"outline"}
                                size={"sm"}
                                className="cursor-pointer"
                                onClick={() => { }}
                            >
                                <IconMinus />
                                행 삭제
                            </Button>


                            <Button
                                variant={"default"}
                                size={"sm"}
                                className="cursor-pointer"
                                onClick={() => { }}
                            >
                                <IconDeviceFloppy />
                                저장
                            </Button>

                        </div>
                    </div>

                    {/* AG Grid */}
                    <div
                        className={`ag-theme-shadcn rounded-lg shadow-sm ${darkMode ? 'shadow-slate-900/50' : 'shadow-slate-200/50'}`}
                        style={{ height: 720, width: '100%' }}
                    >
                        <AgGridReact
                            ref={grid}
                            rowData={rowData}
                            columnDefs={colDefs}
                            localeText={AG_GRID_LOCALE_KR}
                            rowNumbers={true}
                            readOnlyEdit={false}
                            defaultColDef={defaultColDef}
                            rowSelection={rowSelection}
                            selectionColumnDef={selectionColumnDef}
                            animateRows={true}
                            pagination={true}
                            paginationPageSize={20}

                            loadingOverlayComponent={CustomLoadingOverlay}
                            loading={loading}

                            // Pinned Bottom Row
                            pinnedBottomRowData={pinnedBottomRowData}

                        // Group
                        // autoGroupColumnDef={autoGroupColumnDef}
                        // rowGroupPanelShow={"always"}
                        // groupDefaultExpanded={1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}