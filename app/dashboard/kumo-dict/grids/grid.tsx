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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconBook2, IconCheck, IconDeviceFloppy, IconDownload, IconMinus, IconPlus, IconRefresh, IconUpload, IconX } from '@tabler/icons-react';
import CustomLoadingOverlay from '@/components/common/ag-grid/ag-grid-spinner-loading-overlay';
import textCellRenderer from '@/components/shadcn-grid/renderer/textCellRenderer';

ModuleRegistry.registerModules([AllEnterpriseModule]);

// CSV utilities
function toCSVField(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
      else if (ch === '"') { inQuotes = false; i++; }
      else { field += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ',') { row.push(field); field = ''; i++; }
      else if (ch === '\r' && text[i + 1] === '\n') { row.push(field); rows.push(row); row = []; field = ''; i += 2; }
      else if (ch === '\n' || ch === '\r') { row.push(field); rows.push(row); row = []; field = ''; i++; }
      else { field += ch; i++; }
    }
  }
  if (field || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

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
  bodySearch: string;
  missingKanji: boolean;
}

export default function KumoDictGrid({ search, bodySearch, missingKanji }: KumoDictGridProps) {
  const gridRef = useRef<AgGridReact<IEntry>>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(search);
  const bodySearchRef = useRef(bodySearch);
  const missingKanjiRef = useRef(missingKanji);

  useEffect(() => {
    searchRef.current = search;
    bodySearchRef.current = bodySearch;
    missingKanjiRef.current = missingKanji;
    if (gridRef.current?.api) {
      setLoading(true);
      gridRef.current.api.refreshServerSide({ purge: true });
    }
  }, [search, bodySearch, missingKanji]);

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
          bodySearch: bodySearchRef.current,
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

  const handleExport = useCallback(async () => {
    const queryParams = new URLSearchParams({
      search: searchRef.current,
      bodySearch: bodySearchRef.current,
      missingKanji: String(missingKanjiRef.current),
      export: 'true',
    });
    const res = await fetch(`/api/kumo-dict?${queryParams}`);
    const { data } = await res.json() as { data: IEntry[] };

    const headers = ['id', 'headword', 'display', 'body'];
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((h) => toCSVField(row[h as keyof IEntry])).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kumo-dict-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return;

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const idx = {
      id: headers.indexOf('id'),
      headword: headers.indexOf('headword'),
      display: headers.indexOf('display'),
      body: headers.indexOf('body'),
    };

    if (idx.headword === -1) {
      alert('CSV에 headword 열이 없습니다.');
      e.target.value = '';
      return;
    }

    const entries = rows.slice(1)
      .filter((row) => row.some((c) => c.trim()))
      .map((row) => ({
        id: idx.id >= 0 ? parseInt(row[idx.id]) || null : null,
        headword: row[idx.headword] ?? '',
        display: idx.display >= 0 ? row[idx.display] ?? '' : '',
        body: idx.body >= 0 ? row[idx.body] ?? '' : '',
      }))
      .filter((e) => e.headword);

    if (entries.length === 0) { e.target.value = ''; return; }

    const res = await fetch('/api/kumo-dict/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    const { inserted, updated } = await res.json() as { inserted: number; updated: number };
    alert(`가져오기 완료: 추가 ${inserted}건, 수정 ${updated}건`);

    e.target.value = '';
    setLoading(true);
    gridRef.current?.api.refreshServerSide({ purge: true });
  }, []);

  const [kindlePhase, setKindlePhase] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [kindleProgress, setKindleProgress] = useState(0);

  const handleKindleExport = useCallback(async () => {
    setKindlePhase('generating');
    setKindleProgress(0);

    // 진행률 시뮬레이션: API 응답 전까지 0→88% 애니메이션
    let prog = 0;
    const timer = setInterval(() => {
      prog = Math.min(prog + Math.random() * 10 + 4, 88);
      setKindleProgress(Math.round(prog));
    }, 300);

    try {
      const res = await fetch('/api/kumo-dict/kindle-export');
      clearInterval(timer);

      if (!res.ok) { setKindlePhase('error'); return; }

      const blob = await res.blob();
      const filename =
        res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1]
        ?? 'kumo-dict-kindle.zip';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setKindleProgress(100);
      setKindlePhase('done');
    } catch {
      clearInterval(timer);
      setKindlePhase('error');
    }
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
      {/* Kindle 사전 생성 다이얼로그 */}
      <Dialog
        open={kindlePhase !== 'idle'}
        onOpenChange={(open) => { if (!open && kindlePhase !== 'generating') setKindlePhase('idle'); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBook2 size={20} />
              Kindle 사전 생성
            </DialogTitle>
          </DialogHeader>

          {/* 생성 중 */}
          {kindlePhase === 'generating' && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-slate-600">사전 파일을 생성하고 있습니다. 잠시만 기다려주세요.</p>
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-slate-800 transition-all duration-300 ease-out"
                    style={{ width: `${kindleProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-right">{kindleProgress}%</p>
              </div>
            </div>
          )}

          {/* 완료 */}
          {kindlePhase === 'done' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <IconCheck size={18} />
                <span className="text-sm font-medium">ZIP 파일이 다운로드되었습니다.</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-emerald-500 w-full" />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
                <p className="font-semibold text-slate-800">Kindle 사전 등록 방법</p>
                <ol className="space-y-3 text-slate-600 list-decimal list-inside leading-relaxed">
                  <li>ZIP 파일의 압축을 해제합니다.</li>
                  <li>
                    압축 해제 폴더에서 변환 명령어를 실행합니다.
                    <p className="mt-1.5 text-xs text-slate-400">Windows</p>
                    <code className="block bg-slate-800 text-emerald-300 text-xs px-3 py-2 rounded-md font-mono select-all whitespace-pre-wrap break-all">
                      {`"%LOCALAPPDATA%\\Amazon\\Kindle Previewer 3\\lib\\fc\\bin\\kindlegen.exe" kumo-dict\\content.opf -o kumo-dict.mobi`}
                    </code>
                    <p className="mt-1.5 text-xs text-slate-400">Mac</p>
                    <code className="block bg-slate-800 text-emerald-300 text-xs px-3 py-2 rounded-md font-mono select-all">
                      {`kindlegen kumo-dict/content.opf -o kumo-dict.mobi`}
                    </code>
                    <p className="mt-1.5 text-xs text-slate-500">※ 경로에 공백이 있으므로 반드시 따옴표로 감싸야 합니다.</p>
                  </li>
                  <li>
                    생성된{' '}
                    <span className="font-mono text-xs bg-slate-200 px-1 py-0.5 rounded">kumo-dict.mobi</span>
                    {' '}파일을 Kindle에 전송합니다.
                    <ul className="mt-1 ml-4 space-y-1 list-disc text-slate-500">
                      <li>USB 연결 후 <span className="font-mono text-xs">documents</span> 폴더에 복사</li>
                      <li>또는 Send-to-Kindle 이메일로 첨부 전송</li>
                    </ul>
                  </li>
                  <li>Kindle 설정 → 언어와 사전 → 사전에서 등록한 사전을 선택합니다.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 오류 */}
          {kindlePhase === 'error' && (
            <div className="flex items-center gap-2 text-red-600 py-2">
              <IconX size={18} />
              <p className="text-sm">생성 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            </div>
          )}

          <DialogFooter>
            {kindlePhase !== 'generating' && (
              <Button variant="outline" size="sm" onClick={() => setKindlePhase('idle')}>
                닫기
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toolbar */}
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleKindleExport}>
          <IconBook2 />
          Kindle 사전 생성
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleExport}>
          <IconDownload />
          CSV 내보내기
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <IconUpload />
          CSV 가져오기
        </Button>
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
