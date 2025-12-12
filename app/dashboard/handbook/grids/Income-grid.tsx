import React, { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SelectionColumnDef, RowSelectionOptions, ColGroupDef } from "ag-grid-community";
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';
import { Button } from '@/components/ui/button';
import { IconDeviceFloppy, IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import CustomLoadingOverlay from "@/components/common/ag-grid/ag-grid-spinner-loading-overlay"

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface IRow {
    description: string;  // 수입내역
    amount: number;       // 금액
    category: string;     // 분류
    note: string;         // 비고
}

export default function IncomeGrid() {
    const [darkMode, setDarkMode] = useState(false);

    const [colDefs, setColDefs] = useState<(ColDef<IRow> | ColGroupDef<IRow>)[]>([
        {
            field: 'description',
            headerName: '수입내역',
            flex: 1,
        },
        {
            field: 'amount',
            headerName: '금액',
            flex: 1,
            valueFormatter: (params) => {
                return params.value?.toLocaleString() + '원';
            },
        },
        {
            field: 'category',
            headerName: '분류',
            flex: 1,
        },
        {
            field: 'note',
            headerName: '비고',
            flex: 1,
        },
    ])

    const [rowData, setRowData] = useState<IRow[]>([]);

    const defaultColDef = useMemo(() => ({
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
        singleClickEdit: false, // 한 번 클릭 편집
        autoHeight: false,
        floatingFilter: false,
    }), []);

    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            minWidth: 200,
        };
    }, []);

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
                                수입관리
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
                                onClick={() => { }}
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