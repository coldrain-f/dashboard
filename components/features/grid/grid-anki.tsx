'use client';
import React, { StrictMode, useEffect, useMemo, useRef, useState } from "react";

import type { ColDef, ICellRendererParams, RowSelectionOptions, SelectionColumnDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Locale
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

// 테마
import { themeQuartz } from 'ag-grid-community';
import { advencedTheme } from "./ag-grid/theme/advenced-theme";

// 오버레이
import CustomOverlay from "./ag-grid/ag-grid-overlay";

// 커스텀 헤더
import CustomInnerHeader from './ag-grid/header/ag-grid-icon-header';

// Anki
import { invoke } from "@/lib/api/anki"
import { Button } from "@/components/ui/button";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Row Data Interface
interface IRow {
  cardId: number;
  deckName: string;
  exampleJpReading: string;
  confirm: string;
  expression: string;
  meaning: string;
}

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz
  .withParams({
    accentColor: "#087AD1",
    backgroundColor: "#FFFFFF",
    borderColor: "#D7E2E6",
    borderRadius: 2,
    browserColorScheme: "light",
    cellHorizontalPaddingScale: 0.7,
    chromeBackgroundColor: {
      ref: "backgroundColor"
    },
    columnBorder: false,
    fontSize: 13,
    foregroundColor: "#555B62",
    headerBackgroundColor: "#fafafb",
    headerFontSize: 13,
    headerFontWeight: 400,
    // headerTextColor: "#84868B",
    rowBorder: true,
    rowVerticalPaddingScale: 0.8,
    sidePanelBorder: true,
    spacing: 6,
    // wrapperBorder: false,
    wrapperBorderRadius: 2
  });

// Create new GridExample component
const GridExample = () => {
  const rowSelection = useMemo<
    RowSelectionOptions | "single" | "multiple"
  >(() => {
    return { mode: "multiRow" }; // 단일 선택: singleRow
  }, []);

  const selectionColumnDef = useMemo<SelectionColumnDef>(() => {
    return {
      sortable: true,
      resizable: false,
      suppressHeaderMenuButton: false,
      pinned: "left",
    };
  }, []);

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>([]);

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "cardId", headerName: "ID", flex: 0.3, hide: true },
    { field: "deckName", headerName: "덱 이름", flex: 0.3, hide: true, },
    { field: "expression", headerName: "단어", flex: 0.1 },
    { field: "meaning", headerName: "뜻", flex: 0.1 },
    { field: "exampleJpReading", headerName: "일본어 문장", flex: 1 },
    {
      field: "confirm",
      headerName: "검토 여부",
      width: 100,
      pinned: "right",
      editable: false,
      valueFormatter: (p) => {
        if (!p.value) {
          return 'N'
        }
        return p.value
      },
      cellClassRules: {
        'bg-rose-100': params => params.value === 'N' || !params.value,
        'bg-blue-100': params => params.value === 'Y',
      },
      cellStyle: { textAlign: 'center' }
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

  };

  const pagination = true;
  const paginationPageSize = 500;
  const paginationPageSizeSelector = [200, 500, 1000];

  const [isLoading, setIsLoading] = useState(true);

  const grid = useRef<AgGridReact>(null);


  useEffect(() => {
    invoke('findCards', 6, {
      "query": "deck:current"
    })
      .then((cards) => {
        // console.log(cards)
        invoke('cardsInfo', 6, { "cards": cards })
          .then((res) => {
            // console.log(res)
            const newCards: IRow[] = [];
            for (let i = 0; i < res.length; i++) {
              const card: IRow = {
                cardId: res[i].cardId, deckName: res[i].deckName,
                exampleJpReading: res[i].fields.Example_JP_Reading.value,
                confirm: res[i].fields.Confirm.value,
                expression: res[i].fields.Expression.value,
                meaning: res[i].fields.Meaning.value,
              }
              newCards.push(card);
            }

            setRowData(newCards);
            setIsLoading(false);
          })
      })

  }, [])

  // Container: Defines the grid's theme & dimensions.
  return (
    <>
      <div className="flex justify-between mb-6">
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Anki Dashboard
          </h4>
          <span>
            일본어 문장들을 한 행씩 검토해서 읽기 오류만 CSV로 정리해줘.
          </span>
        </div>
        <div className="flex gap-2 justify-end mb-3">
          {/* <Button variant={"outline"} size={"sm"} className="cursor-pointer">행 추가</Button> */}
          <Button variant={"default"} size={"sm"} className="cursor-pointer" onClick={() => {
            grid.current?.api.exportDataAsCsv();
          }}>
            CSV 내보내기
          </Button>
        </div>
      </div>
      <div style={{ height: '710px' }}>
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
        // rowSelection={rowSelection}
        // selectionColumnDef={selectionColumnDef}
        />
      </div>
    </>
  );
};

export function AnkiGrid() {
  return <StrictMode>
    <GridExample />


  </StrictMode>
}