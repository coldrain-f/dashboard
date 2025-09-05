'use client';
import React, { StrictMode, useEffect, useMemo, useState } from "react";

import type { ColDef, RowSelectionOptions, SelectionColumnDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

import { basicTheme } from "@/components/common/ag-grid/theme/basic-theme";
import { advencedTheme } from "@/components/common/ag-grid/theme/advenced-theme";
import CustomOverlay from "@/components/common/ag-grid/ag-grid-overlay";
import CustomInnerHeader from '@/components/common/ag-grid/header/ag-grid-icon-header';

ModuleRegistry.registerModules([AllCommunityModule]);

// Row Data Interface
interface IRow {
  status: string;
  order: string; // 순서
  codeGroup: string; // 상위코드
  code: string; // 코드
  codeName: string; // 코드명
  ref1: string;
  ref2: string;
  ref3: string;
  isUsed: boolean; // 사용 여부
  createdBy: string; // 등록자
  createdDate: string; // 등록일
}

// Create new GridExample component
const MyGrid = () => {
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
    { status: "", order: "001", codeGroup: "A1000", code: "A1001", codeName: "이동", ref1: "", ref2: "", ref3: "", isUsed: true, createdBy: "인상운", createdDate: "2025/08/23" },
    { status: "", order: "002", codeGroup: "A1000", code: "A1002", codeName: "수입", ref1: "", ref2: "", ref3: "", isUsed: true, createdBy: "인상운", createdDate: "2025/08/23" },
    { status: "", order: "003", codeGroup: "A1000", code: "A1003", codeName: "지출", ref1: "", ref2: "", ref3: "", isUsed: true, createdBy: "인상운", createdDate: "2025/08/23" },
  ]);
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    {
      pinned: true,
      field: "status",
      headerName: "상태",
      width: 120,
      editable: false,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      },
    },
    {
      pinned: true,
      field: "codeGroup",
      headerName: "상위 코드",
      width: 150,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      },
      editable: false,
    },
    {
      field: "code",
      headerName: "코드",
      width: 150,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "codeName",
      headerName: "코드명",
      width: 150,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "order",
      headerName: "순서",
      width: 100,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      },
    },
    {
      field: "isUsed",
      headerName: "사용 여부",
      width: 100,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "ref1",
      headerName: "REF1",
      width: 120,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "ref2",
      headerName: "REF2",
      width: 120,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "ref3",
      headerName: "REF3",
      width: 120,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "createdBy",
      headerName: "등록자",
      width: 150,
      editable: false,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      },
      hide: true,
    },
    {
      field: "createdDate",
      headerName: "등록일",
      width: 150,
      editable: false,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      },
      hide: true,
    },
  ]);

  const defaultColDef: ColDef = {
    // flex: 1,
    editable: true,
    filter: true,
    singleClickEdit: false, // 한 번 클릭 편집
    headerComponentParams: {
      innerHeaderComponent: CustomInnerHeader
    },
    cellStyle: {
      'display': 'flex',
      'alignItems': 'center'
    },
    autoHeight: true,
    wrapText: true,

  };

  const pagination = true;
  const paginationPageSize = 1000;
  const paginationPageSizeSelector = [200, 500, 1000];

  const [isLoading, setIsLoading] = useState(true);

  setTimeout(() => { setIsLoading(false) }, 2000)

  useEffect(() => {
    fetch('/api/comments', {
      method: 'GET', headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      res.json().then((json) => {
        console.log(json)
      })
    })
  }, [])

  // Container: Defines the grid's theme & dimensions.
  return (
    <div style={{ height: '647px' }}>
      <AgGridReact
        // rowHeight={40}
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

        // rowDragManaged={false}
        // rowDragEntireRow={true}
        // rowDragMultiRow={true}

        // suppressMoveWhenRowDragging={true}
        rowSelection={rowSelection}
        selectionColumnDef={selectionColumnDef}

        undoRedoCellEditing={true}
        undoRedoCellEditingLimit={20}
      />
    </div>
  );
};

export function CommonCodeManagementGrid() {
  return <StrictMode>
    <MyGrid />
  </StrictMode>
}