'use client';
import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import type { ColDef, ICellEditorParams, ICellRendererParams, RowSelectionOptions, SelectionColumnDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

// Icon
import { IconRefresh, IconPlus, IconMinus, IconDeviceFloppy } from "@tabler/icons-react"

// Locale
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';

// 테마
import { advencedTheme } from "./common/ag-grid/theme/advenced-theme";

// 오버레이
import CustomOverlay from "./common/ag-grid/ag-grid-overlay";

// 커스텀 헤더
import CustomInnerHeader from './common/ag-grid/header/ag-grid-icon-header';

// 렌더러
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// 행 상태 타입 정의
type RowState = 'ORIGINAL' | 'NEW' | 'MODIFIED' | 'DELETED';

// Row Data Interface
interface IRow {
  _key: string;
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
  _state?: RowState; // 행 상태
  _originalData?: Partial<IRow>; // 원본 데이터 (수정 추적용)
}

const BIG_CATEGORY_VALUES_MAP = new Map([
  ['지출', {
    values: ["식비", "카페/간식", "술/유흥", "생활", "온라인쇼핑", "패션/쇼핑", "뷰티/미용", "교통", "자동차", "주거/통신", "의료/건강", "금융", "문화/여가", "여행/숙박", "교육/학습", "자녀/육아", "반려동물", "경조/선물", "가족/부모"],
  }],
  ['수입', {
    values: ['급여', "경비", '상여금', '사업수익', '아르바이트', '용돈', '금융수입', '보험금', '장학금', '부동산', '중고거래', 'SNS', '앱태그', '더치페이', '기타수입']
  }]
])

const SMALL_CATEGORY_VALUES_MAP = new Map([
  ['식비', {
    values: ['한식', '중식', '일식', '양식', '아시아음식', '뷔페', '고기', '치킨', '피자', '패스트푸드', '배달', '식재료']
  }],
  ['카페/간식', {
    values: ['커피/음료', '베이커리', '디저트/떡', '도넛/핫도그', '아이스크림/빙수', '기타간식']
  }],
  ['술/유흥', {
    values: ['맥주/호프', '이자카야', '와인', '바(BAR)', '요리주점', '민속주점', '유흥시설']
  }],
  ['생활', {
    values: ['생필품', '편의점', '마트', '생활서비스', '세탁', '목욕', '가구/가전']
  }],
  ['온라인쇼핑', {
    values: ['인터넷쇼핑', '홈쇼핑', '결제/충전', '앱스토어', '서비스구독']
  }],
  ['패션/쇼핑', {
    values: ['패션', '신발', '아울렛/몰', '스포츠의류', '백화점']
  }],
  ['뷰티/미용', {
    values: ['화장품', '헤어샵', '미용관리', '미용용품', '네일', '성형외과', '피부과']
  }],
  ['교통', {
    values: ['택시', '대중교통', '철도', '시외버스']
  }],
  ['자동차', {
    values: ['주유', '주차', '세차', '통행료', '할부/리스', '정비/수리', '차량보험', '대리운전']
  }],
  ['주거/통신', {
    values: ['휴대폰', '인터넷', '월세', '관리비', '가스비', '전기세']
  }],
  ['의료/건강', {
    values: ['약국', '종합병원', '피부과', '소아과', '산부인과', '안과', '이비인후과', '비뇨기과', '성형외과', '내과/가정의학', '정형외과', '치과', '한의원', '기타병원', '보조식품', '건강용품', '운동']
  }],
  ['금융', {
    values: ['보험', '은행', '증권/투자', '카드', '이자/대출', '세금/과태료']
  }],
  ['문화/여가', {
    values: ['영화', '도서', '게임', '음악', '공연', '전시/관람', '취미/체험', '테마파크', '스포츠', '마사지/스파']
  }],
  ['여행/숙박', {
    values: ['숙박비', '항공권', '여행', '관광', '여행용품', '해외결제']
  }],
  ['교육/학습', {
    values: ['학원/강의', '학습교재', '학교', '시험료']
  }],
  ['자녀/육아', {
    values: ['육아용품', '돌봄비', '자녀용돈', '자녀교육', '놀이/체험']
  }],
  ['반려동물', {
    values: ['동물병원', '펫용품', '사료/간식']
  }],
  ['경조/선물', {
    values: ['축의금', '부의금', '기부/현금', '선물', '회비']
  }],
  ['가족/부모', {
    values: ['생활비 지원']
  }]
]);

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
            border: 'solid 2px #999999'
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
      const rows = jsonData.data.map((row: IRow) => ({
        ...row,
        _state: 'ORIGINAL' as RowState,
        _originalData: { ...row }
      }));
      setRowData(rows);
      setIsLoading(false);
    }

    fetchData();
  }, []);

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

  const [rowData, setRowData] = useState<IRow[]>([]);

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
      onCellValueChanged: onCellValueChanged
    },
    {
      field: "col2",
      headerName: "분류",
      cellEditor: "agSelectCellEditor",
      onCellValueChanged: (event) => {
        // 기존 로직
        event.data.col3 = '';
        event.data.col4 = '';
        grid.current?.api.applyTransaction({ update: [event.data] });

        // 상태 업데이트
        onCellValueChanged(event);
      },
      cellEditorParams: {
        values: ["지출", "수입", "이동",],
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
      onCellValueChanged: (event) => {
        // 기존 로직
        event.data.col4 = '';
        grid.current?.api.applyTransaction({ update: [event.data] });

        // 상태 업데이트
        onCellValueChanged(event);
      },
      cellEditorParams: (params: ICellEditorParams<IRow>) => {
        const category = params.data.col2;
        return BIG_CATEGORY_VALUES_MAP.get(category) || { values: [] };
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
      onCellValueChanged: onCellValueChanged,
      cellEditorParams: (params: ICellEditorParams<IRow>) => {
        const category = params.data.col3;
        return SMALL_CATEGORY_VALUES_MAP.get(category) || { values: [] };
      },
    },
    {
      field: "col5",
      headerName: "내용",
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
      },
      onCellValueChanged: onCellValueChanged
    },
    {
      field: "col6",
      headerName: "금액",
      valueFormatter: p => '₩' + p.value.toLocaleString(),
      cellStyle: { justifyContent: "end" },
      cellClassRules: {
        'text-emerald-700': params => params.data?.col2 === "수입",
        'text-red-700': params => params.data?.col2 === "지출",
      },
      onCellValueChanged: onCellValueChanged
    },
    {
      field: "col7",
      headerName: "입금계좌",
      cellClassRules: {
        'bg-gray-200': params => params.value === "",
      },
      onCellValueChanged: onCellValueChanged,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: (params: ICellEditorParams<IRow>) => {
        return {
          values: ['하나 급여', '']
        }
      },
    },
    {
      field: "col8",
      headerName: "출금계좌",
      cellClassRules: {
        'bg-gray-200': params => params.value === "",
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: (params: ICellEditorParams<IRow>) => {
        return {
          values: ['하나 급여', '']
        }
      },
      onCellValueChanged: onCellValueChanged
    },
    {
      field: "col9",
      headerName: "경비 여부",
      onCellValueChanged: onCellValueChanged
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
  const paginationPageSize = 100;
  const paginationPageSizeSelector = [100, 500, 1000];

  const [isLoading, setIsLoading] = useState(true);

  // 그리드 초기화
  const clearGrid = useCallback(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch("/api/household-ledger", { method: 'GET' });
      const jsonData = await res.json();
      const rows = jsonData.data.map((row: IRow) => ({
        ...row,
        _state: 'ORIGINAL' as RowState,
        _originalData: { ...row }
      }));
      setRowData(rows);
      setIsLoading(false);
    }

    fetchData();
    toast.success("상태가 초기화 되었습니다.");
  }, [])

  // 신규 행 추가
  const addNewRow = useCallback(() => {
    const newRow: IRow = {
      _id: null,
      _key: `new_${Date.now()}_${Math.random().toString(36)}`,
      col1: new Date().toISOString().split('T')[0],
      col2: "지출",
      col3: "",
      col4: "",
      col5: "",
      col6: 0,
      col7: "",
      col8: "",
      col9: false,
      _state: 'NEW',
      _originalData: {}
    };

    grid.current?.api.applyTransaction({
      add: [newRow],
      addIndex: 0 // 맨 앞에 추가
    });

    toast.success("신규 행이 추가되었습니다.");
  }, []);

  const deleteSelectedRows = useCallback(() => {
    const selectedRows = grid.current?.api.getSelectedRows() || [];

    if (selectedRows.length === 0) return;

    // 신규 행과 기존 행 분리
    const newRows = selectedRows.filter(row => row._state === 'NEW');
    const existingRows = selectedRows.filter(row => row._state !== 'NEW');
    const transaction: any = {};

    // 신규 행은 바로 제거
    if (newRows.length > 0) {
      transaction.remove = newRows;
    }

    if (existingRows.length > 0) {
      transaction.update = existingRows.map(row => ({
        ...row,           // 모든 기존 데이터 유지 (_id 포함)
        _state: 'DELETED' as RowState  // _state만 변경
      }));
    }

    grid.current?.api.applyTransaction(transaction);
    toast.success("선택된 행이 삭제되었습니다.");
  }, []);

  // 실제 저장 (상태에 따라 처리)
  const saveChanges = useCallback(async () => {
    const allRows: IRow[] = [];
    grid.current?.api.forEachNode(node => {
      if (node.data) {
        allRows.push(node.data);
      }
    });

    const newRows = allRows.filter(row => row._state === 'NEW');
    const modifiedRows = allRows.filter(row => row._state === 'MODIFIED');
    const deletedRows = allRows.filter(row => row._state === 'DELETED');

    try {
      // 로딩 시작
      setIsLoading(true);

      // 신규 데이터 저장
      if (newRows.length > 0) {
        await fetch("/api/household-ledger", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRows.map(row => {
            const { _state, _originalData, ...cleanRow } = row;
            return cleanRow;
          }))
        });
      }

      // 수정된 데이터 업데이트
      if (modifiedRows.length > 0) {
        await fetch("/api/household-ledger", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modifiedRows.map(row => {
            const { _state, _originalData, ...cleanRow } = row;
            return cleanRow;
          }))
        });
      }

      // 삭제된 데이터 처리
      if (deletedRows.length > 0) {
        await fetch("/api/household-ledger", {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deletedRows)
        });

        // 삭제된 행들을 그리드에서 즉시 제거
        grid.current?.api.applyTransaction({
          remove: deletedRows
        });
      }

      // 데이터 다시 로드
      const res = await fetch("/api/household-ledger", { method: 'GET' });
      const jsonData = await res.json();
      const freshRows = jsonData.data.map((row: IRow) => ({
        ...row,
        _state: 'ORIGINAL' as RowState,
        _originalData: { ...row }
      }));

      // applyTransaction으로 전체 데이터 교체
      grid.current?.api.setGridOption('rowData', freshRows);
      toast.success("저장을 완료했습니다.");

      // 로딩 종료
      setIsLoading(false);

    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");

      // 로딩 종료
      setIsLoading(false);
    }
  }, [rowData]);

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

      {/* Toaster */}
      <Toaster richColors={true} position="top-right" closeButton={false} />

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
              border: 'solid 2px #999999'
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="cursor-pointer gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 rounded-lg"
                >
                  <IconRefresh />
                  초기화
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 초기화하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    현재 작업 내용을 초기화합니다. 계속하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    취소
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clearGrid()}
                    className="cursor-pointer"
                  >
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant={"outline"}
              size={"sm"}
              className="cursor-pointer"
              onClick={addNewRow}
            >
              <IconPlus />
              행 추가
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              className="cursor-pointer"
              onClick={deleteSelectedRows}
            >
              <IconMinus />
              행 삭제
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"default"}
                  size={"sm"}
                  className="cursor-pointer"
                >
                  <IconDeviceFloppy />
                  저장
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 저장하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    현재 작업 내용을 저장합니다. 계속하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    취소
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => saveChanges()}
                    className="cursor-pointer"
                  >
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
      </div>

      <div style={{ height: '565px' }}>
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
    </div>
  );
};

export function Grid() {
  return <StrictMode>
    <GridExample />
  </StrictMode>
}