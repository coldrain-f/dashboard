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
  housing: string; // 주거비
  finance: string;  // 금융
  insurance: string; // 보험
  telecom: string;  // 통신비
  transportation: string; // 교통비
  subscription: string; // 구독료
  others: string; // 기타
}

const Grid = () => {
  const grid = useRef<AgGridReact>(null);

  const [rowData, setRowData] = useState<IRow[]>([
    { _key: '1', _id: '1', housing: '₩0', finance: '₩0', insurance: '₩0', telecom: '₩0', transportation: '₩0', subscription: '₩44,900', others: '₩0' },
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
      field: "subscription",
      headerName: "구독료",
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "housing",
      headerName: "주거비",
      flex: 1.2,
      cellEditor: 'agTextCellEditor',
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "finance",
      headerName: "금융",
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "insurance",
      headerName: "보험",
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "telecom",
      headerName: "통신비",
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "transportation",
      headerName: "교통비",
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "others",
      headerName: "기타",
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
    editable: false,
    filter: true,
    singleClickEdit: false,
    sortable: false,
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

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div style={{ height: '75px' }}>
      <AgGridReact
        ref={grid}
        getRowId={params => params.data._id || params.data._key}
        theme={advencedTheme}
        localeText={AG_GRID_LOCALE_KR}

        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}

        loadingOverlayComponent={CustomOverlay}
        loading={isLoading}

        rowBuffer={100} // 스크롤 시 버벅임과 영향 있음

        undoRedoCellEditing={true}
        undoRedoCellEditingLimit={20}

        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
};

export function FixedExpensesTotalGrid() {
  return <StrictMode>
    <Grid />
  </StrictMode>
}