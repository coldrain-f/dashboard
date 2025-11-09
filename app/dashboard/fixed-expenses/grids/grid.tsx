'use client';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from "react";
import type { ColDef, ICellRendererParams, RowSelectionOptions, SelectionColumnDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Locale
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

// 테마
import { advencedTheme } from "@/components/common/ag-grid/theme/advenced-theme";

// 오버레이
import CustomOverlay from "@/components/common/ag-grid/ag-grid-overlay";

// 커스텀 헤더
import CustomInnerHeader from "@/components/common/ag-grid/header/ag-grid-icon-header";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 행 상태 타입 정의
type RowState = 'ORIGINAL' | 'NEW' | 'MODIFIED' | 'DELETED';

interface IRow {
  _key: string;
  _id: string | null;
  expenseName: string; // 지출항목명
  category: string; // 카테고리
  amount: number; // 금액
  paymentDay: string; // 결제일
  paymentMethod: string;  // 결제수단
  paymentAccount: string; // 결제계좌/카드
  startDate: string;  // 시작일
  endDate: string;    // 종료일
  isActive: boolean; // 활성상태
  memo: string; // 메모
  _state?: RowState; // 행 상태
  _originalData?: Partial<IRow>; // 원본 데이터 (수정 추적용)
}

// 상태 렌더러 컴포넌트
const StateRenderer = (params: ICellRendererParams) => {
  const state = params.data._state;

  const getStateInfo = (state: RowState) => {
    switch (state) {
      case 'NEW':
        return { text: '신규', className: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'MODIFIED':
        return { text: '수정', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'DELETED':
        return { text: '삭제', className: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { text: '', className: '' };
    }
  };

  if (!state || state === 'ORIGINAL') return null;

  const stateInfo = getStateInfo(state);

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${stateInfo.className}`}>
      {stateInfo.text}
    </span>
  );
};

const Grid = () => {
  const grid = useRef<AgGridReact>(null);

  const rowSelection = useMemo<
    RowSelectionOptions | "single" | "multiple"
  >(() => {
    return { mode: "multiRow" };
  }, []);

  const selectionColumnDef = useMemo<SelectionColumnDef>(() => {
    return {
      sortable: true,
      resizable: false,
      suppressHeaderMenuButton: false,
      pinned: "left",
    };
  }, []);

  const [rowData, setRowData] = useState<IRow[]>([
    {
      _key: '1',
      _id: '1',
      expenseName: 'Tving',
      category: '▶️ 구독료',
      amount: 12900,
      paymentDay: '30일',
      paymentMethod: '신용카드',
      paymentAccount: '하나은행',
      startDate: '2023-01-01',
      endDate: '-',
      isActive: true,
      memo: '매월 납부',
      _state: 'ORIGINAL',
    },
    {
      _key: '2',
      _id: '2',
      expenseName: 'Claude AI',
      category: '▶️ 구독료',
      amount: 32000,
      paymentDay: '06일',
      paymentMethod: '신용카드',
      paymentAccount: '하나은행',
      startDate: '2025-05-10',
      endDate: '-',
      isActive: true,
      memo: '매월 납부',
      _state: 'ORIGINAL',
    },
  ]);

  // 행 상태 업데이트 함수
  const updateRowState = useCallback((updatedRow: IRow, newState: RowState) => {
    const updatedRowWithNewState = { ...updatedRow, _state: newState };

    grid.current?.api.applyTransaction({
      update: [updatedRowWithNewState]
    });
  }, []);

  // 셀 값 변경 감지 함수
  const onCellValueChanged = useCallback((event: any) => {
    const { data, oldValue, newValue, colDef } = event;

    // 상태 컬럼은 제외
    if (colDef.field === '_state') return;

    // 신규 행이 아니고, 값이 실제로 변경되었고, 아직 수정 상태가 아닌 경우에만 수정 상태로 변경
    if (data._state !== 'NEW' && data._state !== 'MODIFIED' && oldValue !== newValue) {
      updateRowState(data, 'MODIFIED');
    }
  }, []);

  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    {
      field: "_state",
      headerName: "상태",
      width: 80,
      enableCellChangeFlash: false, // 깜박임 방지
      cellRenderer: StateRenderer,
      cellRendererParams: {
        deferRender: true
      },
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      },
      editable: false,
      filter: false,
      sortable: false,
      pinned: "left",
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    {
      field: "_id",
      headerName: "No.",
      hide: true,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      }
    },
    {
      field: "expenseName",
      headerName: "지출항목명",
      flex: 1.2,
      cellEditor: 'agTextCellEditor',
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
      onCellValueChanged: onCellValueChanged
    },
    {
      field: "category",
      headerName: "카테고리",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["🏠 주거비", "💰 금융", "🛡️ 보험", "📞 통신비", "🚇 교통비", "▶️ 구독료", "📦 기타"],
      }
    },
    {
      field: "amount",
      headerName: "금액",
      valueFormatter: p => '₩' + p.value.toLocaleString()
    },
    {
      field: "paymentDay",
      headerName: "결제일"
    },
    {
      field: "paymentMethod",
      headerName: "결제수단",
    },
    {
      field: "paymentAccount",
      headerName: "결제계좌/카드",
    },
    {
      field: "startDate",
      headerName: "시작일",
    },
    {
      field: "endDate",
      headerName: "종료일",
    },
    {
      field: "memo",
      headerName: "메모"
    },
    {
      field: "isActive",
      headerName: "활성상태"
    },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
    editable: true,
    filter: true,
    singleClickEdit: false,
    headerComponentParams: {
      innerHeaderComponent: CustomInnerHeader
    },
    cellStyle: {
      'display': 'flex',
      'alignItems': 'center'
    },
    autoHeight: true,
    wrapText: true,

    // 행 상태에 따른 스타일 적용
    cellClassRules: {
      'bg-blue-50': params => params.data?._state === 'NEW',
      'bg-yellow-50': params => params.data?._state === 'MODIFIED',
      'bg-red-50 opacity-60': params => params.data?._state === 'DELETED',
    }
  };

  const pagination = true;
  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 30, 50];

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div style={{ height: '550px' }}>
      <AgGridReact
        ref={grid}
        getRowId={params => params.data._id || params.data._key}
        theme={advencedTheme}
        localeText={AG_GRID_LOCALE_KR}

        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}

        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}

        loadingOverlayComponent={CustomOverlay}
        loading={isLoading}

        rowSelection={rowSelection}
        selectionColumnDef={selectionColumnDef}

        rowBuffer={100} // 스크롤 시 버벅임과 영향 있음

        undoRedoCellEditing={true}
        undoRedoCellEditingLimit={20}

        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
};

export function FixedExpensesGrid() {
  return <StrictMode>
    <Grid />
  </StrictMode>
}