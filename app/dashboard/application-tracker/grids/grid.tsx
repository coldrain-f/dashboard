import React, { useState, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SelectionColumnDef, RowSelectionOptions, ColGroupDef } from "ag-grid-community";
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AG_GRID_LOCALE_KR } from '@ag-grid-community/locale';
import { Button } from '@/components/ui/button';
import { IconDeviceFloppy, IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomLoadingOverlay from "@/components/common/ag-grid/ag-grid-spinner-loading-overlay"
import textCellRenderer from '@/components/shadcn-grid/renderer/textCellRenderer';
import selectCellRenderer from '@/components/shadcn-grid/renderer/selectCellRenderer';

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface IRow {
    companyName: string; // 기업명
    industry: string; // 산업군
    position: string; // 직무
    companySize: string; // 기업규모
    appliedDate: string; // 지원일
    deadline: string; // 마감일
    stageOneType: string;   // 1차 전형
    stageTwoType: string;   // 2차 전형
    stageThreeType: string; // 3차 전형
    stageFourType: string;  // 4차 전형
    stageOneResult: string;   // 1차 결과
    stageTwoResult: string;   // 2차 결과
    stageThreeResult: string; // 3차 결과
    stageFourResult: string;  // 4차 결과
    overallStatus: string; // 진행 결과
}

// 상태별 색상 매핑
const getStatusColor = (value: string, darkMode: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
        // 결과 상태
        '합격': { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'bg-emerald-900/30', darkText: 'text-emerald-400' },
        '불합격': { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'bg-red-900/30', darkText: 'text-red-400' },
        '대기': { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'bg-amber-900/30', darkText: 'text-amber-400' },
        '미응시': { bg: 'bg-slate-100', text: 'text-slate-500', darkBg: 'bg-slate-800', darkText: 'text-slate-400' },

        // 진행현황 상태
        '지원예정': { bg: 'bg-slate-100', text: 'text-slate-600', darkBg: 'bg-slate-800', darkText: 'text-slate-400' },
        '지원완료': { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
        '서류통과': { bg: 'bg-sky-100', text: 'text-sky-700', darkBg: 'bg-sky-900/30', darkText: 'text-sky-400' },
        '진행중': { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'bg-violet-900/30', darkText: 'text-violet-400' },
        '최종합격': { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'bg-emerald-900/30', darkText: 'text-emerald-400' },
        '포기': { bg: 'bg-slate-100', text: 'text-slate-500', darkBg: 'bg-slate-800', darkText: 'text-slate-400' },
    };

    const colors = colorMap[value];
    if (!colors) return '';

    return darkMode
        ? `${colors.darkBg} ${colors.darkText}`
        : `${colors.bg} ${colors.text}`;
};

// 상태 배지가 있는 Select 셀 렌더러
const StatusSelectCellRenderer = (props: any) => {
    if (props.node.group) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', height: '42px', lineHeight: '42px' }}>
                {props.value}
            </div>
        );
    }

    const options = props.colDef.cellRendererParams?.options || [];
    const isDarkMode = document.documentElement.classList.contains('dark') ||
        props.context?.darkMode ||
        document.querySelector('.dark') !== null;

    const handleValueChange = (newValue: string) => {
        props.setValue(newValue);
    };

    const colorClass = getStatusColor(props.value, isDarkMode);

    return (
        <div className="w-full h-full flex items-center" style={{ padding: '0 4px' }}>
            <Select value={props.value} onValueChange={handleValueChange}>
                <SelectTrigger
                    className={`w-full h-8 border-none shadow-none focus:ring-0 rounded-full px-3 font-medium text-xs ${colorClass || 'bg-transparent'}`}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(opt, isDarkMode)}`}>
                                    {opt}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};




// // 차트 색상 설정
// const COLORS = {
//     진행중: "#8b5cf6",    // violet
//     최종합격: "#10b981",  // emerald
//     불합격: "#ef4444",    // red
//     지원완료: "#3b82f6",  // blue
//     지원예정: "#94a3b8",  // slate
//     포기: "#64748b",      // slate
// };

// const INDUSTRY_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];
// const SIZE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

// 차트 데이터 계산 함수들
const getStatusData = (data: IRow[]) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
        const status = row.overallStatus || "지원예정";
        counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getIndustryData = (data: IRow[]) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
        if (row.industry) {
            counts[row.industry] = (counts[row.industry] || 0) + 1;
        }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getCompanySizeData = (data: IRow[]) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
        if (row.companySize) {
            counts[row.companySize] = (counts[row.companySize] || 0) + 1;
        }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const getMonthlyData = (data: IRow[]) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
        if (row.appliedDate) {
            const month = row.appliedDate.substring(0, 7); // "2025-06"
            counts[month] = (counts[month] || 0) + 1;
        }
    });
    return Object.entries(counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }));
};

// 요약 통계 계산
const getSummaryStats = (data: IRow[]) => {
    let total = data.length;
    let inProgress = 0;
    let passed = 0;
    let failed = 0;

    data.forEach(row => {
        const status = row.overallStatus;
        if (status === "진행중" || status === "지원완료") inProgress++;
        else if (status === "최종합격") passed++;
        else if (status === "불합격") failed++;
    });

    return { total, inProgress, passed, failed };
};

export default function ApplicationTrackerGrid() {
    const [darkMode, setDarkMode] = useState(false);

    const [colDefs, setColDefs] = useState<(ColDef<IRow> | ColGroupDef<IRow>)[]>([
        {
            headerName: "기업정보",
            children: [
                {
                    field: 'companyName',
                    headerName: '회사명',
                    width: 200,
                    filter: 'agTextColumnFilter',
                    cellRenderer: textCellRenderer,
                },
                {
                    field: 'industry',
                    headerName: '산업군',
                    width: 140,
                    filter: 'agTextColumnFilter',
                    cellRenderer: selectCellRenderer,
                    cellRendererParams: {
                        options: ['IT', '금융', '제조', "유통", "서비스", "게임", "컨설팅"],
                    },
                },
                {
                    field: 'companySize',
                    headerName: '회사규모',
                    width: 140,
                    filter: 'agTextColumnFilter',
                    cellRenderer: selectCellRenderer,
                    cellRendererParams: {
                        options: ["대기업", "중견기업", "중소기업", "스타트업", "외국계"],
                    },
                },
            ]
        },
        {
            headerName: "지원정보",
            children: [
                {
                    field: 'position',
                    headerName: '직무',
                    width: 160,
                    filter: 'agTextColumnFilter',
                    cellRenderer: textCellRenderer,
                },
                {
                    field: 'appliedDate',
                    headerName: '지원일',
                    width: 130,
                    filter: 'agDateColumnFilter',  // 날짜 필터
                    cellDataType: 'dateString',

                },
                {
                    field: 'deadline',
                    headerName: '마감일',
                    width: 130,
                    filter: 'agDateColumnFilter',
                    cellDataType: 'dateString',
                },
            ]
        },
        {
            headerName: "전형단계",
            children: [
                {
                    headerName: '1차',
                    children: [
                        {
                            field: 'stageOneType',
                            headerName: '전형',
                            width: 160,
                            cellRenderer: selectCellRenderer,
                            cellRendererParams: {
                                options: ["서류", "인적성", "필기", "코딩테스트", "과제", "면접"],
                            },
                        },
                        {
                            field: 'stageOneResult',
                            headerName: '결과',
                            width: 120,
                            cellRenderer: StatusSelectCellRenderer,
                            cellRendererParams: {
                                options: ["대기", "합격", "불합격", "미응시"],
                            },
                        }
                    ]
                },
                {
                    headerName: '2차',
                    children: [
                        {
                            field: 'stageTwoType',
                            headerName: '전형',
                            width: 160,
                            cellRenderer: selectCellRenderer,
                            cellRendererParams: {
                                options: ["서류", "인적성", "필기", "코딩테스트", "과제", "면접"],
                            },
                        },
                        {
                            field: 'stageTwoResult',
                            headerName: '결과',
                            width: 120,
                            cellRenderer: StatusSelectCellRenderer,
                            cellRendererParams: {
                                options: ["대기", "합격", "불합격", "미응시"],
                            },
                        }
                    ]
                },
                {
                    headerName: '3차',
                    children: [
                        {
                            field: 'stageThreeType',
                            headerName: '전형',
                            width: 160,
                            cellRenderer: selectCellRenderer,
                            cellRendererParams: {
                                options: ["서류", "인적성", "필기", "코딩테스트", "과제", "면접"],
                            },
                        },
                        {
                            field: 'stageThreeResult',
                            headerName: '결과',
                            width: 120,
                            cellRenderer: StatusSelectCellRenderer,
                            cellRendererParams: {
                                options: ["대기", "합격", "불합격", "미응시"],
                            },
                        }
                    ]
                },
                {
                    headerName: '4차',
                    children: [
                        {
                            field: 'stageFourType',
                            headerName: '전형',
                            width: 160,
                            cellRenderer: selectCellRenderer,
                            cellRendererParams: {
                                options: ["서류", "인적성", "필기", "코딩테스트", "과제", "면접"],
                            },
                        },
                        {
                            field: 'stageFourResult',
                            headerName: '결과',
                            width: 120,
                            cellRenderer: StatusSelectCellRenderer,
                            cellRendererParams: {
                                options: ["대기", "합격", "불합격", "미응시"],
                            },
                        }
                    ]
                },
            ]
        },
        {
            headerName: "진행현황",
            field: "overallStatus",
            width: 150,
            cellRenderer: StatusSelectCellRenderer,
            cellRendererParams: {
                options: ["지원예정", "지원완료", "진행중", "최종합격", "불합격", "포기"],
            },
            pinned: "right",
            valueGetter: (params: any) => {
                const data = params.data;
                if (!data) return "";

                // 포기는 수동으로만 설정
                if (data.overallStatus === "포기") return "포기";

                const results = [
                    data.stageOneResult,
                    data.stageTwoResult,
                    data.stageThreeResult,
                    data.stageFourResult,
                ];

                const types = [
                    data.stageOneType,
                    data.stageTwoType,
                    data.stageThreeType,
                    data.stageFourType,
                ];

                // 불합격이 하나라도 있으면 → 불합격
                if (results.includes("불합격")) return "불합격";

                // 미응시가 있으면 → 포기로 처리 (또는 별도 상태)
                if (results.includes("미응시")) return "포기";

                // 마지막으로 입력된 전형 찾기
                let lastFilledIndex = -1;
                for (let i = 3; i >= 0; i--) {
                    if (types[i] && types[i] !== "") {
                        lastFilledIndex = i;
                        break;
                    }
                }

                // 전형이 하나도 없으면 → 지원예정
                if (lastFilledIndex === -1) return "지원예정";

                // 마지막 전형 결과 확인
                const lastResult = results[lastFilledIndex];

                // 마지막 결과가 대기면
                if (lastResult === "대기") {
                    // 첫 번째 전형이 대기면 → 지원완료
                    if (lastFilledIndex === 0) return "지원완료";
                    // 그 외 → 진행중
                    return "진행중";
                }

                // 마지막 결과가 합격이면
                if (lastResult === "합격") {
                    // 면접 합격이면 → 최종합격
                    if (types[lastFilledIndex] === "면접") return "최종합격";
                    // 그 외 합격이면 → 진행중 (다음 전형 대기)
                    return "진행중";
                }

                return "지원예정";
            },
        }
    ])

    const [rowData, setRowData] = useState<IRow[]>([
        {
            companyName: "네이버",
            industry: "IT",
            companySize: "대기업",
            position: "프론트엔드 개발자",
            appliedDate: "2025-06-01",
            deadline: "2025-06-15",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "코딩테스트",
            stageTwoResult: "합격",
            stageThreeType: "면접",
            stageThreeResult: "대기",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 진행중
        },
        {
            companyName: "카카오",
            industry: "IT",
            companySize: "대기업",
            position: "백엔드 개발자",
            appliedDate: "2025-05-20",
            deadline: "2025-06-10",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "코딩테스트",
            stageTwoResult: "불합격",
            stageThreeType: "",
            stageThreeResult: "",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 불합격
        },
        {
            companyName: "라인플러스",
            industry: "IT",
            companySize: "대기업",
            position: "풀스택 개발자",
            appliedDate: "2025-06-05",
            deadline: "2025-06-20",
            stageOneType: "서류",
            stageOneResult: "대기",
            stageTwoType: "",
            stageTwoResult: "",
            stageThreeType: "",
            stageThreeResult: "",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 지원완료
        },
        {
            companyName: "토스",
            industry: "금융",
            companySize: "스타트업",
            position: "프론트엔드 개발자",
            appliedDate: "2025-05-25",
            deadline: "2025-06-08",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "과제",
            stageTwoResult: "합격",
            stageThreeType: "면접",
            stageThreeResult: "합격",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 최종합격
        },
        {
            companyName: "쿠팡",
            industry: "유통",
            companySize: "대기업",
            position: "소프트웨어 엔지니어",
            appliedDate: "2025-06-02",
            deadline: "2025-06-18",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "인적성",
            stageTwoResult: "합격",
            stageThreeType: "코딩테스트",
            stageThreeResult: "대기",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 진행중
        },
        {
            companyName: "삼성SDS",
            industry: "IT",
            companySize: "대기업",
            position: "클라우드 엔지니어",
            appliedDate: "2025-05-15",
            deadline: "2025-05-30",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "필기",
            stageTwoResult: "합격",
            stageThreeType: "면접",
            stageThreeResult: "합격",
            stageFourType: "면접",
            stageFourResult: "합격",
            overallStatus: "", // 자동: 최종합격
        },
        {
            companyName: "당근마켓",
            industry: "IT",
            companySize: "스타트업",
            position: "iOS 개발자",
            appliedDate: "2025-06-10",
            deadline: "2025-06-25",
            stageOneType: "서류",
            stageOneResult: "대기",
            stageTwoType: "",
            stageTwoResult: "",
            stageThreeType: "",
            stageThreeResult: "",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 지원완료
        },
        {
            companyName: "구글코리아",
            industry: "IT",
            companySize: "외국계",
            position: "소프트웨어 엔지니어",
            appliedDate: "2025-05-10",
            deadline: "2025-05-25",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "코딩테스트",
            stageTwoResult: "미응시",
            stageThreeType: "",
            stageThreeResult: "",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "포기", // 수동: 포기
        },
        {
            companyName: "현대오토에버",
            industry: "제조",
            companySize: "대기업",
            position: "시스템 엔지니어",
            appliedDate: "2025-06-08",
            deadline: "2025-06-22",
            stageOneType: "서류",
            stageOneResult: "합격",
            stageTwoType: "인적성",
            stageTwoResult: "대기",
            stageThreeType: "",
            stageThreeResult: "",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 진행중
        },
        {
            companyName: "SK C&C",
            industry: "IT",
            companySize: "대기업",
            position: "데이터 엔지니어",
            appliedDate: "2025-06-12",
            deadline: "2025-06-30",
            stageOneType: "",
            stageOneResult: "",
            stageTwoType: "",
            stageTwoResult: "",
            stageThreeType: "",
            stageThreeResult: "",
            stageFourType: "",
            stageFourResult: "",
            overallStatus: "", // 자동: 지원예정
        },
    ])

    const defaultColDef = useMemo(() => ({
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
        singleClickEdit: false, // 한 번 클릭 편집
        autoHeight: false,
        floatingFilter: false,
    }), []);

    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            minWidth: 200,
        };
    }, []);

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

    const [loading, setLoading] = useState(true)


    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 200)
    }, [])


    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className={`transition-colors duration-200 ${darkMode ? 'bg-slate-950' : ''}`}>
                <div className="mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                지원 현황
                            </h1>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                지원부터 최종 결과까지 전형 단계별로 관리할 수 있습니다.
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
                        style={{ height: 650, width: '100%' }}
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

                            loadingOverlayComponent={CustomLoadingOverlay}
                            loading={loading}

                        // Group
                        // autoGroupColumnDef={autoGroupColumnDef}
                        // rowGroupPanelShow={"always"}
                        // groupDefaultExpanded={1}
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