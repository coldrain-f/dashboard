'use client';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ColDef, RowSelectionOptions, SelectionColumnDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

import { advencedTheme } from "@/components/common/ag-grid/theme/advenced-theme";
import CustomOverlay from "@/components/common/ag-grid/ag-grid-overlay";
import CustomInnerHeader from '@/components/common/ag-grid/header/ag-grid-icon-header';
import { Button } from "@/components/ui/button";

ModuleRegistry.registerModules([AllCommunityModule]);

// Row Data Interface
interface IRow {
  status: string;
  code: string; // 코드
  codeName: string; // 코드명
  isUsed: boolean; // 사용 여부
  createdBy: string; // 등록자
  createdDate: string; // 등록일
}

// Create new GridExample component
const MyGrid = () => {

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
    // { status: "", code: "A1000", codeName: "거래 유형", isUsed: true, createdBy: "인상운", createdDate: "2025/08/23" },
  ]);
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    {
      field: "status",
      headerName: "상태",
      editable: false,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      }
    },
    {
      field: "code",
      headerName: "코드",
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
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: false,
        }
      }
    },
    {
      field: "isUsed",
      headerName: "사용 여부",
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
    flex: 1,
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

  const onCellValueChanged = useCallback((event: any) => {
    // 값이 실제로 변경된 경우만 처리
    if (event.oldValue !== event.newValue) {
      if (event.data.status === "신규") {
        return;
      }
      event.data.status = "수정"
      event.api.applyTransaction({ update: [event.data] })
    }
  }, []);

  const addRow = useCallback(() => {
    setRowData(prevData =>
      [
        ...prevData,
        { status: "신규", code: "", codeName: "", isUsed: true, createdBy: "", createdDate: "" },
      ])
  }, [rowData])

  // 데이터 조회
  useEffect(() => {

    const fetchData = async () => {
      const res = await fetch("/api/common-code-groups", { method: 'GET' });
      const jsonData = await res.json();
      const commonCodeGroups = jsonData.data;
      setRowData(commonCodeGroups);
    }

    fetchData();
    setIsLoading(false);

  }, []);

  return (
    <>
      <div className="flex justify-between">
        <div>
          {/* <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            상위 코드
          </h4> */}
          <div style={{
            display: 'flex',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'inline-block',
              verticalAlign: 'top',
              margin: '7px 7px 8px 0px',
              height: '7px',
              width: '7px',
              border: 'solid 2px #f26522'
            }} />
            <div>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                상위 코드
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end mb-2">
          <Button variant={"outline"} size={"sm"} className="cursor-pointer" onClick={() => {
            addRow()
          }}>
            행 추가
          </Button>
          <Button variant={"outline"} size={"sm"} className="cursor-pointer" onClick={() => {
            const fetchData = async () => {
              const res = await fetch("/api/common-code-groups", { method: 'GET' });
              const jsonData = await res.json();
              const commonCodeGroups = jsonData.data;
              setRowData(commonCodeGroups);
            }

            const deleteData = async () => {
              await fetch("/api/common-code-groups", {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(grid.current?.api.getSelectedRows())
              });
            }

            deleteData();
            fetchData();
          }}>
            행 삭제
          </Button>
          <Button variant={"default"} size={"sm"} className="cursor-pointer"
            onClick={() => {
              setIsLoading(true);
              const fetchData = async () => {
                const res = await fetch("/api/common-code-groups", { method: 'GET' });
                const jsonData = await res.json();
                const commonCodeGroups = jsonData.data;
                setRowData(commonCodeGroups);
              }

              const saveData = async () => {
                const res = await fetch("/api/common-code-groups", {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(rowData.filter(row => row.status === '신규'))
                })
              }

              saveData();
              fetchData();
              setIsLoading(false);
            }}>
            저장
          </Button>
        </div>
      </div>
      <div style={{ height: '647px' }}>
        <AgGridReact
          // rowHeight={40}
          ref={grid}
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

          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </>
  );
};

export function CommonCodeGroupManagementGrid() {
  return <StrictMode>
    <MyGrid />
  </StrictMode>
}