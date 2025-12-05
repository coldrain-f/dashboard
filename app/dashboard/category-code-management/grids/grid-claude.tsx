import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SelectionColumnDef, RowSelectionOptions, ColGroupDef } from "ag-grid-community";
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';
import { Button } from '@/components/ui/button';
import { IconDeviceFloppy, IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

ModuleRegistry.registerModules([AllEnterpriseModule]);

// shadcn/ui 스타일과 어울리는 AG Grid 테마
const shadcnGridStyles = `
  .ag-theme-shadcn {
    --ag-background-color: hsl(0 0% 100%);
    --ag-foreground-color: hsl(222.2 84% 4.9%);
    --ag-border-color: hsl(214.3 31.8% 91.4%);
    --ag-secondary-border-color: hsl(214.3 31.8% 91.4%);
    --ag-header-background-color: hsl(210 40% 98%);
    --ag-header-foreground-color: hsl(222.2 47.4% 11.2%);
    --ag-odd-row-background-color: hsl(0 0% 100%);
    --ag-row-hover-color: hsl(210 40% 96.1%);
    --ag-selected-row-background-color: hsl(210 40% 96.1%);
    --ag-range-selection-border-color: hsl(222.2 47.4% 11.2%);
    --ag-range-selection-background-color: hsl(210 40% 96.1% / 0.5);
    --ag-input-focus-border-color: hsl(222.2 47.4% 11.2%);
    --ag-checkbox-checked-color: hsl(222.2 47.4% 11.2%);
    --ag-checkbox-unchecked-color: hsl(215.4 16.3% 46.9%);
    --ag-checkbox-indeterminate-color: hsl(222.2 47.4% 11.2%);
    
    --ag-font-family: ui-sans-serif, system-ui, sans-serif;
    --ag-font-size: 13px;
    --ag-grid-size: 6px;
    --ag-list-item-height: 32px;
    --ag-row-height: 44px;
    --ag-header-height: 44px;
    --ag-cell-horizontal-padding: 16px;
    
    --ag-borders: solid 1px;
    // --ag-border-radius: 8px;
    --ag-wrapper-border-radius: 8px;
    
    border-radius: 8px;
    border: 1px solid hsl(214.3 31.8% 91.4%);
    overflow: hidden;
  }

  .ag-row-number-cell {
    color:hsl(215 20.2% 65.1%);
}
  .ag-theme-shadcn .ag-root-wrapper {
    border: none;
    border-radius: 8px;
  }

  .ag-theme-shadcn .ag-header {
    border-bottom: 1px solid hsl(214.3 31.8% 91.4%);
    font-weight: 500;
  }

  .ag-theme-shadcn .ag-header-cell {
    padding-left: 16px;
    padding-right: 16px;
  }

  .ag-theme-shadcn .ag-header-cell-text {
    font-weight: 500;
    color: hsl(215.4 16.3% 46.9%);
    font-size: 13px;
    text-transform: none;
    letter-spacing: 0;
  }

  .ag-theme-shadcn .ag-header-group-text {
    font-weight: 500; 
    color: hsl(215.4 16.3% 46.9%);
    font-size: 13px;
    text-transform: none;
    letter-spacing: 0;
}

  .ag-theme-shadcn .ag-cell {
    display: flex;
    align-items: center;
    line-height: 1.5;
    border-right: none;
  }

  .ag-theme-shadcn .ag-row {
    border-bottom: 1px solid hsl(214.3 31.8% 91.4%);
  }

  .ag-theme-shadcn .ag-row:last-child {
    border-bottom: none;
  }

  .ag-theme-shadcn .ag-row-hover {
    background-color: hsl(210 40% 96.1%);
  }

  .ag-theme-shadcn .ag-row-selected {
    background-color: hsl(210 40% 96.1%);
  }

  .ag-theme-shadcn .ag-paging-panel {
    border-top: 1px solid hsl(214.3 31.8% 91.4%);
    height: 52px;
    padding: 0 16px;
    color: hsl(215.4 16.3% 46.9%);
    font-size: 14px;
  }

  .ag-theme-shadcn .ag-paging-button {
    border: 1px solid hsl(214.3 31.8% 91.4%);
    border-radius: 6px;
    padding: 4px 8px;
    margin: 0 2px;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ag-theme-shadcn .ag-paging-button:hover:not(.ag-disabled) {
    background-color: hsl(210 40% 96.1%);
    border-color: hsl(214.3 31.8% 91.4%);
  }

  .ag-theme-shadcn .ag-paging-button.ag-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Checkbox styling */
  .ag-theme-shadcn .ag-checkbox-input-wrapper {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid hsl(214.3 31.8% 91.4%);
  }

  .ag-theme-shadcn .ag-checkbox-input-wrapper.ag-checked {
    background-color: hsl(222.2 47.4% 11.2%);
    border-color: hsl(222.2 47.4% 11.2%);
  }

  /* Sort icons */
  .ag-theme-shadcn .ag-sort-indicator-icon {
    color: hsl(215.4 16.3% 46.9%);
  }

  /* Filter icon */
  .ag-theme-shadcn .ag-header-cell-menu-button {
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .ag-theme-shadcn .ag-header-cell:hover .ag-header-cell-menu-button {
    opacity: 1;
  }

  /* Loading overlay */
  .ag-theme-shadcn .ag-overlay-loading-center {
    background-color: hsl(0 0% 100% / 0.9);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  /* Dark mode support */
  .dark .ag-theme-shadcn {
    --ag-background-color: hsl(222.2 84% 4.9%);
    --ag-foreground-color: hsl(210 40% 98%);
    --ag-border-color: hsl(217.2 32.6% 17.5%);
    --ag-secondary-border-color: hsl(217.2 32.6% 17.5%);
    --ag-header-background-color: hsl(222.2 84% 4.9%);
    --ag-header-foreground-color: hsl(210 40% 98%);
    --ag-odd-row-background-color: hsl(222.2 84% 4.9%);
    --ag-row-hover-color: hsl(217.2 32.6% 17.5%);
    --ag-selected-row-background-color: hsl(217.2 32.6% 17.5%);
    
    border-color: hsl(217.2 32.6% 17.5%);
  }

.dark .ag-theme-shadcn .ag-icon-first,
.dark .ag-theme-shadcn .ag-icon-previous,
.dark .ag-theme-shadcn .ag-icon-next,
.dark .ag-theme-shadcn .ag-icon-last {
    color: hsl(210 40% 98%);
}

  .dark .ag-theme-shadcn .ag-header {
    border-bottom-color: hsl(217.2 32.6% 17.5%);
  }

  .dark .ag-theme-shadcn .ag-row {
    border-bottom-color: hsl(217.2 32.6% 17.5%);
  }

  .dark .ag-theme-shadcn .ag-paging-panel {
    border-top-color: hsl(217.2 32.6% 17.5%);
  }

  .dark .ag-theme-shadcn .ag-header-cell-text {
    color: hsl(215 20.2% 65.1%);
  }

   // Checkbox styling in dark mode
  .dark .ag-theme-shadcn .ag-checkbox-input-wrapper {
    border-color: hsl(215 20.2% 65.1%);
}

.dark .ag-theme-shadcn .ag-checkbox-input-wrapper.ag-checked {
    background-color: hsl(210 40% 98%);
    border-color: hsl(210 40% 98%);
}

.dark .ag-theme-shadcn .ag-checkbox-input-wrapper.ag-checked::after {
    color: hsl(222.2 84% 4.9%);
}
`;

interface IRow {
    name: string;
    email: string; // 코드
    role: string; // 코드명
    lastActive: string; // 사용 여부
    status: string; // 등록자
    isLocked?: boolean;
}


// 드롭다운 아이콘이 항상 보이는 셀 렌더러
const SelectCellRenderer = (props: any) => {
    return (
        <div className="flex items-center justify-between w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">
            <span className='w-full'>{props.value}</span>
        </div>
    );
};

const TextCellRenderer = (props: any) => {
    return (
        <div className="w-full h-10 flex items-center px-3 border border-slate-200 rounded bg-white hover:border-slate-300">
            {props.value}
        </div>
    );
};

const ShadcnSelectCellRenderer = (props: any) => {
    const handleValueChange = (newValue: string) => {
        props.setValue(newValue);  // AG Grid 셀 값 업데이트
    };

    return (
        <div className="w-full h-full flex items-center" style={{ padding: '0 4px' }}>
            <Select value={props.value} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full h-8 border-none shadow-none bg-transparent focus:ring-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

const ShadcnActiveSelectCellRenderer = (props: any) => {
    const handleValueChange = (newValue: string) => {
        props.setValue(newValue);  // AG Grid 셀 값 업데이트
    };

    return (
        <div className="w-full h-full flex items-center" style={{ padding: '0 4px' }}>
            <Select value={props.value} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full h-8 border-none shadow-none bg-transparent focus:ring-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default function ShadcnAgGrid() {
    const [darkMode, setDarkMode] = useState(false);

    const [colDefs, setColDefs] = useState<(ColDef<IRow> | ColGroupDef<IRow>)[]>([
        {
            headerName: "User",
            children: [
                {
                    field: 'name',
                    headerName: 'Name',
                    flex: 2,
                    minWidth: 200,
                    filter: 'agTextColumnFilter',  // 텍스트 필터
                    editable: false,
                },
                {
                    field: 'email',
                    headerName: 'Email',
                    flex: 2,
                    minWidth: 200,
                    filter: 'agTextColumnFilter',  // 텍스트 필터
                    cellRenderer: TextCellRenderer,
                },
            ]
        },
        {
            field: 'role',
            headerName: 'Role',
            flex: 1,
            minWidth: 120,
            cellEditor: "agSelectCellEditor",
            cellEditorParams: {
                values: ["Administrator", "Editor", "Viewer"],
            },
            cellRenderer: ShadcnSelectCellRenderer,  // 커스텀 렌더러 추가
            editable: false,
        },
        {
            headerName: "Status",
            children: [
                {
                    field: 'status',
                    headerName: 'Status',
                    flex: 1,
                    minWidth: 120,
                    cellRenderer: ShadcnActiveSelectCellRenderer
                },
                {
                    field: 'isLocked',
                    headerName: 'IsLocked',
                    flex: 1,
                    minWidth: 120,
                },
                {
                    field: 'lastActive',
                    headerName: 'Last Active',
                    flex: 1,
                    minWidth: 120,
                    filter: 'agDateColumnFilter',  // 날짜 필터
                },
            ]
        },

    ])

    const [rowData, setRowData] = useState<IRow[]>([
        { name: "Alice Johnson", email: "alice.johnson@example.com", role: "Administrator", status: "Active", lastActive: "2024-06-20", isLocked: false },
        { name: "Bob Smith", email: "bob.smith@example.com", role: "Editor", status: "Inactive", lastActive: "2024-05-15", isLocked: true },
        { name: "Charlie Brown", email: "charlie.brown@example.com", role: "Viewer", status: "Active", lastActive: "2024-06-18", isLocked: false },
        { name: "Diana Prince", email: "diana.prince@example.com", role: "Editor", status: "Active", lastActive: "2024-06-19", isLocked: false },
        { name: "Ethan Hunt", email: "ethan.hunt@example.com", role: "Administrator", status: "Inactive", lastActive: "2024-04-30", isLocked: true },
        { name: "Fiona Gallagher", email: "fiona.gallagher@example.com", role: "Viewer", status: "Active", lastActive: "2024-06-17", isLocked: false },
        { name: "George Martin", email: "george.martin@example.com", role: "Editor", status: "Active", lastActive: "2024-06-16", isLocked: false },
        { name: "Hannah Baker", email: "hannah.baker@example.com", role: "Viewer", status: "Inactive", lastActive: "2024-03-22", isLocked: true },
        { name: "Ian Fleming", email: "ian.fleming@example.com", role: "Administrator", status: "Active", lastActive: "2024-06-15", isLocked: false },
        { name: "Jane Doe", email: "jane.doe@example.com", role: "Editor", status: "Active", lastActive: "2024-06-14", isLocked: false },
    ])

    const defaultColDef = useMemo(() => ({
        flex: 1,
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
        singleClickEdit: false, // 한 번 클릭 편집
        autoHeight: false,
        floatingFilter: true,
    }), []);

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

    return (
        <div className={darkMode ? 'dark' : ''}>
            <style>{shadcnGridStyles}</style>
            <div className={`transition-colors duration-200 ${darkMode ? 'bg-slate-950' : ''}`}>
                <div className="mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                사용자 목록
                            </h1>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                샘플 데이터가 포함된 AG Grid 예제입니다.
                            </p>
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
                        style={{ height: 530, width: '100%' }}
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
                        />
                    </div>

                    {/* Footer info */}
                    <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Tip: 열 헤더를 클릭하면 정렬, 드래그하면 열 너비를 조절할 수 있습니다
                    </p>
                </div>
            </div>
        </div>
    );
}