'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RowSelectionOptions,
  SelectionColumnDef,
  GetRowIdParams,
} from 'ag-grid-community';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';
import { Button } from '@/components/ui/button';
import { IconDeviceFloppy, IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import CustomLoadingOverlay from '@/components/common/ag-grid/ag-grid-spinner-loading-overlay';
import textCellRenderer from '@/components/shadcn-grid/renderer/textCellRenderer';

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface IEntry {
  id: number;
  headword: string;
  display: string;
  body: string;
}

const BodyCellRenderer = (props: CustomCellRendererProps) => {
  if (!props.value) return null;
  const text = props.value.replace(/<[^>]*>/g, '').substring(0, 120);
  return (
    <div className="w-full h-10 flex items-center px-3 border border-slate-200 rounded bg-white hover:border-slate-300 truncate text-slate-600">
      {text}
    </div>
  );
};

interface KumoDictGridProps {
  search: string;
  missingKanji: boolean;
}

export default function KumoDictGrid({ search, missingKanji }: KumoDictGridProps) {
  const gridRef = useRef<AgGridReact<IEntry>>(null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(search);
  const missingKanjiRef = useRef(missingKanji);

  useEffect(() => {
    searchRef.current = search;
    missingKanjiRef.current = missingKanji;
    if (gridRef.current?.api) {
      setLoading(true);
      gridRef.current.api.refreshServerSide({ purge: true });
    }
  }, [search, missingKanji]);

  const colDefs = useMemo<ColDef<IEntry>[]>(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      editable: false,
      sortable: true,
      filter: false,
    },
    {
      field: 'headword',
      headerName: '표제어',
      width: 160,
      editable: true,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: textCellRenderer,
    },
    {
      field: 'display',
      headerName: '표시',
      width: 160,
      editable: true,
      sortable: true,
      filter: false,
      cellRenderer: textCellRenderer,
    },
    {
      field: 'body',
      headerName: '내용',
      flex: 1,
      editable: true,
      sortable: false,
      filter: false,
      cellRenderer: BodyCellRenderer,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      cellEditorParams: { maxLength: 10000, rows: 15, cols: 80 },
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
    singleClickEdit: false,
    autoHeight: false,
    floatingFilter: false,
  }), []);

  const selectionColumnDef = useMemo<SelectionColumnDef>(() => ({
    sortable: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    pinned: 'left',
    width: 50,
  }), []);

  const rowSelection = useMemo<RowSelectionOptions>(() => ({
    mode: 'multiRow',
  }), []);

  const datasource = useMemo<IServerSideDatasource>(() => ({
    getRows: async (params: IServerSideGetRowsParams) => {
      const { startRow, endRow, sortModel } = params.request;
      const sortField = sortModel?.[0]?.colId ?? 'id';
      const sortDir = sortModel?.[0]?.sort ?? 'asc';

      try {
        const queryParams = new URLSearchParams({
          startRow: String(startRow ?? 0),
          endRow: String(endRow ?? 100),
          search: searchRef.current,
          sortField,
          sortDir,
          missingKanji: String(missingKanjiRef.current),
        });
        const res = await fetch(`/api/kumo-dict?${queryParams}`);
        const { data, total } = await res.json();
        params.success({ rowData: data, rowCount: total });
        setLoading(false);
      } catch {
        params.fail();
        setLoading(false);
      }
    },
  }), []);

  const getRowId = useCallback((params: GetRowIdParams<IEntry>) => String(params.data.id), []);

  const handleAddRow = useCallback(() => {
    gridRef.current?.api.applyServerSideTransaction({
      add: [{ id: -Date.now(), headword: '', display: '', body: '' }],
      addIndex: 0,
    });
  }, []);

  const handleDeleteRows = useCallback(async () => {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (selected.length === 0) return;
    const realRows = selected.filter((r) => r.id > 0);
    await Promise.all(
      realRows.map((row) => fetch(`/api/kumo-dict/${row.id}`, { method: 'DELETE' }))
    );
    gridRef.current?.api.refreshServerSide({ purge: false });
  }, []);

  const handleReset = useCallback(() => {
    setLoading(true);
    gridRef.current?.api.refreshServerSide({ purge: true });
  }, []);

  const onCellValueChanged = useCallback(async (event: any) => {
    const { data } = event;
    if (!data.id || data.id < 0) return;
    await fetch(`/api/kumo-dict/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headword: data.headword,
        display: data.display,
        body: data.body,
      }),
    });
  }, []);

  return (
    <div className="space-y-3 mt-4">
      {/* Toolbar */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          className="cursor-pointer gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 rounded-lg"
          onClick={handleReset}
        >
          <IconRefresh />
          초기화
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleAddRow}>
          <IconPlus />
          행 추가
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleDeleteRows}>
          <IconMinus />
          행 삭제
        </Button>
        <Button variant="default" size="sm" className="cursor-pointer" onClick={() => gridRef.current?.api.refreshServerSide({ purge: false })}>
          <IconDeviceFloppy />
          저장
        </Button>
      </div>

      {/* AG Grid */}
      <div
        className="ag-theme-shadcn rounded-lg shadow-sm shadow-slate-200/50"
        style={{ height: 650, width: '100%' }}
      >
          <AgGridReact<IEntry>
            ref={gridRef}
            rowModelType="serverSide"
            serverSideDatasource={datasource}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            localeText={AG_GRID_LOCALE_KR}
            rowNumbers={true}
            readOnlyEdit={false}
            animateRows={true}
            rowSelection={rowSelection}
            selectionColumnDef={selectionColumnDef}
            getRowId={getRowId}
            cacheBlockSize={100}
            maxBlocksInCache={10}
            pagination={true}
            paginationPageSize={100}
            paginationPageSizeSelector={[50, 100, 200]}
            loadingOverlayComponent={CustomLoadingOverlay}
            loading={loading}
            undoRedoCellEditing={true}
            undoRedoCellEditingLimit={20}
            onCellValueChanged={onCellValueChanged}
          />
      </div>

      {/* Footer tip */}
      <p className="text-xs text-slate-400">
        Tip: 열 헤더를 클릭하면 정렬, 드래그하면 열 너비를 조절할 수 있습니다
      </p>
    </div>
  );
}
