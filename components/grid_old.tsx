'use client';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import type { ColDef, ICellEditorParams, ICellRendererParams, RowSelectionOptions, SelectionColumnDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Locale
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

// 테마
import { themeQuartz } from 'ag-grid-community';
import { advencedTheme } from "./common/ag-grid/theme/advenced-theme";

// 오버레이
import CustomOverlay from "./common/ag-grid/ag-grid-overlay";

// 커스텀 헤더
import CustomInnerHeader from './common/ag-grid/header/ag-grid-icon-header';

// 렌더러
import SelectCellRenderer from "./common/ag-grid/renderer/selectCellRenderer";
import textCellRenderer from "./common/ag-grid/renderer/textCellRenderer";
import { SearchForm } from "./search-from";
import { Button } from "./ui/button";
import { ca } from "zod/v4/locales";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";


// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Row Data Interface
interface IRow {
  _id: string | null;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: number;
  col7: string;
  col8: string;
  col9: boolean; // 경비 여부
}

const IncomeExpenseSummary = () => {
  const data = [
    {
      month: '9월',
      expense: '0원',
      income: '0원',
      netIncome: '+0원'
    },
    {
      month: '8월',
      expense: '0원',
      income: '0원',
      netIncome: '+0원'
    }
  ];

  return (
    <div className="mt-2 mb-6">
      {/* 헤더 */}
      <div>
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
              수입 & 지출 총액
            </span>
          </div>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-gray-50 border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 gap-0 text-xs">
          {/* 헤더 */}
          <div className="bg-gray-100 px-3 py-2 font-medium text-gray-600 border-b border-r border-gray-200">
            월
          </div>
          <div className="bg-gray-100 px-3 py-2 font-medium text-gray-600 border-b border-r border-gray-200">
            지출 총액
          </div>
          <div className="bg-gray-100 px-3 py-2 font-medium text-gray-600 border-b border-r border-gray-200">
            수입 총액
          </div>
          <div className="bg-gray-100 px-3 py-2 font-medium text-gray-600 border-b border-r border-gray-200">
            순수입
          </div>
          <div className="bg-gray-100 px-3 py-2 font-medium text-gray-600 border-b border-gray-200">
            경비 포함
          </div>

          {/* 데이터 행들 */}
          {data.map((item, index) => (
            <React.Fragment key={item.month}>
              <div className={`px-3 py-2 text-gray-700 font-medium border-r border-gray-200 ${index < data.length - 1 ? 'border-b' : ''}`}>
                {item.month}
              </div>
              <div className={`px-3 py-2 text-gray-800 border-r border-gray-200 ${index < data.length - 1 ? 'border-b' : ''}`}>
                {item.expense}
              </div>
              <div className={`px-3 py-2 text-gray-800 border-r border-gray-200 ${index < data.length - 1 ? 'border-b' : ''}`}>
                {item.income}
              </div>
              <div className={`px-3 py-2 text-green-600 font-semibold border-r border-gray-200 ${index < data.length - 1 ? 'border-b' : ''}`}>
                {item.netIncome}
              </div>
              <div className={`px-3 py-2 border-gray-200 ${index < data.length - 1 ? 'border-b' : ''}`}>
                <Switch className="cursor-pointer" />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Create new GridExample component
const GridExample = () => {
  const grid = useRef<AgGridReact>(null);

  useEffect(() => {

    const fetchData = async () => {
      const res = await fetch("/api/household-ledger", { method: 'GET' });
      const jsonData = await res.json();
      const rows = jsonData.data;
      setRowData(rows);
      setIsLoading(false);
    }

    fetchData();

  }, []);

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

  const [rowData, setRowData] = useState<IRow[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    {
      field: "_id", headerName: "No.",
      hide: true,
      headerComponentParams: {
        innerHeaderComponent: CustomInnerHeader,
        innerHeaderComponentParams: {
          isLock: true,
        }
      }
    },
    {
      field: "col1",
      headerName: "날짜",
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
      field: "col2", headerName: "분류",
      cellEditor: "agSelectCellEditor",

      // 카테고리 & 세부 카테고리 초기화
      onCellValueChanged(event) {
        event.data.col3 = '';
        event.data.col4 = '';
        grid.current?.api.applyTransaction({ update: [event.data] });
      },

      cellEditorParams: {
        values: [
          "지출",
          "수입",
          "이동",
        ],
      },
      cellClassRules: {
        'bg-stone-100': params => params.value === "이동",
        'bg-emerald-100': params => params.value === "수입",
        'bg-rose-100': params => params.value === "지출",
      }
    },
    {
      field: "col3",
      headerName: "카테고리",

      // 세부 카테고리 초기화
      onCellValueChanged(event) {
        event.data.col4 = '';
        grid.current?.api.applyTransaction({ update: [event.data] });
      },

      cellEditorParams: (params: ICellEditorParams<IRow>) => {
        const category = params.data.col2;
        if (category === '지출') {
          return {
            values: ["식비", "카페/간식", "술/유흥", "생활", "온라인쇼핑", "패션/쇼핑", "뷰티/미용", "교통", "자동차", "주거/통신", "의료/건강", "금융", "문화/여가", "여행/숙박", "교육/학습", "자녀/육아", "반려동물", "경조/선물", "가족/부모"],
          }
        } else if (category === '수입') {
          return {
            values: ['급여', "경비", '상여금', '사업수익', '아르바이트', '용돈', '금융수입', '보험금', '장학금', '부동산', '중고거래', 'SNS', '앱태그', '더치페이', '기타수입']
          }
        }
      },

      cellEditor: "agSelectCellEditor",
    },
    {
      field: "col4",
      headerName: "세부 카테고리",
      cellClassRules: {
        'bg-gray-200': params => params.data?.col2 === "수입",
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: (params: ICellEditorParams<IRow>) => {
        const category = params.data.col3;
        if (category === '식비') {
          return {
            values: ['한식', '중식', '일식', '양식', '아시아음식', '뷔페', '고기', '치킨', '피자', '패스트푸드', '배달', '식재료']
          }
        } else if (category === '카페/간식') {
          return {
            values: ['커피/음료', '베이커리', '디저트/떡', '도넛/핫도그', '아이스크림/빙수', '기타간식']
          }
        } else if (category === '술/유흥') {
          return {
            values: ['맥주/호프', '이자카야', '와인', '바(BAR)', '요리주점', '민속주점', '유흥시설']
          }
        } else if (category === '생활') {
          return {
            values: ['생필품', '편의점', '마트', '생활서비스', '세탁', '목욕', '가구/가전']
          }
        } else if (category === '온라인쇼핑') {
          return {
            values: ['인터넷쇼핑', '홈쇼핑', '결제/충전', '앱스토어', '서비스구독']
          }
        } else if (category === '패션/쇼핑') {
          return {
            values: ['패션', '신발', '아울렛/몰', '스포츠의류', '백화점']
          }
        } else if (category === '뷰티/미용') {
          return {
            values: ['화장품', '헤어샵', '미용관리', '미용용품', '네일', '성형외과', '피부과']
          }
        } else if (category === '교통') {
          return {
            values: ['택시', '대중교통', '철도', '시외버스']
          }
        } else if (category === '자동차') {
          return {
            values: ['주유', '주차', '세차', '통행료', '할부/리스', '정비/수리', '차량보험', '대리운전']
          }
        } else if (category === '주거/통신') {
          return {
            values: ['휴대폰', '인터넷', '월세', '관리비', '가스비', '전기세']
          }
        } else if (category === '의료/건강') {
          return {
            values: ['약국', '종합병원', '피부과', '소아과', '산부인과', '안과', '이비인후과', '비뇨기과', '성형외과', '내과/가정의학', '정형외과', '치과', '한의원', '기타병원', '보조식품', '건강용품', '운동']
          }
        } else if (category === '금융') {
          return {
            values: ['보험', '은행', '증권/투자', '카드', '이자/대출', '세금/과태료']
          }
        } else if (category === '문화/여가') {
          return {
            values: ['영화', '도서', '게임', '음악', '공연', '전시/관람', '취미/체험', '테마파크', '스포츠', '마사지/스파']
          }
        } else if (category === '여행/숙박') {
          return {
            values: ['숙박비', '항공권', '여행', '관광', '여행용품', '해외결제']
          }
        } else if (category === '교육/학습') {
          return {
            values: ['학원/강의', '학습교재', '학교', '시험료']
          }
        } else if (category === '자녀/육아') {
          return {
            values: ['육아용품', '돌봄비', '자녀용돈', '자녀교육', '놀이/체험']
          }
        } else if (category === '반려동물') {
          return {
            values: ['동물병원', '펫용품', '사료/간식']
          }
        } else if (category === '경조/선물') {
          return {
            values: ['축의금', '부의금', '기부/현금', '선물', '회비']
          }
        } else if (category === '가족/부모') {
          return {
            values: ['생활비 지원']
          }
        }
        return "";
      },
    },
    {
      field: "col5", headerName: "내용",

      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      cellEditorParams: {
        maxLength: 1000,
        rows: 5,
        cols: 22
      },
      minWidth: 80,
      cellStyle: {
        'whiteSpace': 'pre-wrap',
        'wordWrap': 'break-word',
        'lineHeight': '1.4'
      }
    },
    {
      field: "col6", headerName: "금액",
      valueFormatter: p => '₩' + p.value.toLocaleString(),
      cellStyle: { justifyContent: "end" },
      cellClassRules: {
        'text-emerald-700': params => params.data?.col2 === "수입",
        'text-red-700': params => params.data?.col2 === "지출",
      }
    },
    {
      field: "col7", headerName: "입금계좌",
      cellClassRules: {
        'bg-gray-200': params => params.value === "",
      }
    },
    {
      field: "col8", headerName: "출금계좌",
      cellClassRules: {
        'bg-gray-200': params => params.value === "",
      }
    },
    {
      field: "col9", headerName: "경비 여부",
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
  const paginationPageSize = 20;
  const paginationPageSizeSelector = [20, 500, 1000];

  const [isLoading, setIsLoading] = useState(true);

  const addNewRow = useCallback(() => {
    setRowData(prevData =>
      [
        {
          _id: null,
          col0: "",
          col1: "",
          col2: "지출", // 소분류
          col3: "",
          col4: "",
          col5: "",
          col6: 0,
          col7: "",
          col8: "",
          col9: false,
        },
        ...prevData

      ])
  }, [rowData])

  return (
    <div>
      <div className="flex justify-between mb-1">
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            가계부 관리
          </h4>
        </div>
      </div>
      <Separator className="mb-5" />

      {/* 디테일 영역 */}
      <IncomeExpenseSummary />

      {/* Taster */}
      <Toaster richColors={false} position="top-center" closeButton={false} />
      <div className="flex justify-between">
        <div>
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
                가계부 기록
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-2 justify-end mb-3 mr-3">
            <Button variant={"outline"} size={"sm"} className="cursor-pointer" onClick={() => {
              // addNewRow();
              const newRow = {
                _id: null,
                col0: "",
                col1: new Date().toISOString().split('T')[0],
                col2: "지출", // 소분류
                col3: "",
                col4: "",
                col5: "",
                col6: 0,
                col7: "",
                col8: "",
                col9: false,
              }

              const fetchData = async () => {
                const res = await fetch("/api/household-ledger", { method: 'GET' });
                const jsonData = await res.json();
                const commonCodeGroups = jsonData.data;
                setRowData([]);
                setRowData([...commonCodeGroups]);
              }

              const saveData = async () => {
                await fetch("/api/household-ledger", {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify([newRow])
                })
              }

              const refresh = async () => {
                await saveData();
                await fetchData();

                toast.success("신규 데이터 추가를 완료했습니다.");
              }

              refresh();
            }}>
              행 추가
            </Button>
            <Button variant={"outline"} size={"sm"} className="cursor-pointer"
              onClick={() => {
                const fetchData = async () => {
                  const res = await fetch("/api/household-ledger", { method: 'GET' });
                  const jsonData = await res.json();
                  const commonCodeGroups = jsonData.data;
                  setRowData([]);
                  setRowData([...commonCodeGroups]);
                }

                const deleteData = async () => {
                  await fetch("/api/household-ledger", {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(grid.current?.api.getSelectedRows())
                  })
                }

                const refresh = async () => {
                  await deleteData();
                  await fetchData();

                  toast.success("삭제를 완료했습니다.");
                }

                refresh();
              }}>
              행 삭제
            </Button>
            <Button variant={"default"} size={"sm"} className="cursor-pointer"
              onClick={() => {
                const fetchData = async () => {
                  const res = await fetch("/api/household-ledger", { method: 'GET' });
                  const jsonData = await res.json();
                  const commonCodeGroups = jsonData.data;
                  setRowData([]);
                  setRowData([...commonCodeGroups]);
                }

                const saveData = async () => {
                  await fetch("/api/household-ledger", {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(rowData)
                  })
                }

                const refresh = async () => {
                  await saveData();
                  await fetchData();

                  toast.success("저장을 완료했습니다.");
                }

                refresh();
              }}>
              저장
            </Button>
          </div>
        </div>
      </div>

      <div style={{ height: '565px' }}>
        <AgGridReact
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

          rowSelection={rowSelection}
          selectionColumnDef={selectionColumnDef}

          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
        />
      </div>
    </div >
  );
};

export function Grid() {
  return <StrictMode>
    <GridExample />


  </StrictMode>
}