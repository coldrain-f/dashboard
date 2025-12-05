import { themeQuartz } from 'ag-grid-community';

export const shadcnTheme = themeQuartz
    .withParams({
        // 기본 색상
        accentColor: "hsl(222.2, 47.4%, 11.2%)",
        backgroundColor: "hsl(0, 0%, 100%)",
        foregroundColor: "hsl(222.2, 84%, 4.9%)",
        borderColor: "hsl(214.3, 31.8%, 91.4%)",

        // 헤더 스타일
        headerBackgroundColor: "hsl(210, 40%, 98%)",
        headerTextColor: "hsl(215.4, 16.3%, 46.9%)",
        headerFontSize: 13,
        headerFontWeight: 500,

        // 행 스타일
        oddRowBackgroundColor: "hsl(0, 0%, 100%)",
        rowHoverColor: "hsl(210, 40%, 96.1%)",
        selectedRowBackgroundColor: "hsl(210, 40%, 96.1%)",

        // 범위 선택
        rangeSelectionBorderColor: "hsl(222.2, 47.4%, 11.2%)",
        rangeSelectionBackgroundColor: "hsl(210, 40%, 96.1%, 0.5)",

        // 크기 & 간격
        fontSize: 14,
        spacing: 6,
        cellHorizontalPaddingScale: 1,
        rowVerticalPaddingScale: 1.1,

        // 테두리 설정
        borderRadius: 8,
        wrapperBorderRadius: 8,
        wrapperBorder: true,
        rowBorder: true,
        columnBorder: false,
        headerRowBorder: true,
        sidePanelBorder: true,

        // 브라우저 색상 스키마
        browserColorScheme: "light",

        chromeBackgroundColor: {
            ref: "backgroundColor"
        },
    });

// 다크 모드용 테마
export const shadcnThemeDark = themeQuartz
    .withParams({
        // 기본 색상 (다크)
        accentColor: "hsl(210, 40%, 98%)",
        backgroundColor: "hsl(222.2, 84%, 4.9%)",
        foregroundColor: "hsl(210, 40%, 98%)",
        borderColor: "hsl(217.2, 32.6%, 17.5%)",

        // 헤더 스타일 (다크)
        headerBackgroundColor: "hsl(222.2, 84%, 4.9%)",
        headerTextColor: "hsl(215, 20.2%, 65.1%)",
        headerFontSize: 13,
        headerFontWeight: 500,

        // 행 스타일 (다크)
        oddRowBackgroundColor: "hsl(222.2, 84%, 4.9%)",
        rowHoverColor: "hsl(217.2, 32.6%, 17.5%)",
        selectedRowBackgroundColor: "hsl(217.2, 32.6%, 17.5%)",

        // 범위 선택
        rangeSelectionBorderColor: "hsl(210, 40%, 98%)",
        rangeSelectionBackgroundColor: "hsl(217.2, 32.6%, 17.5%, 0.5)",

        // 크기 & 간격
        fontSize: 14,
        spacing: 6,
        cellHorizontalPaddingScale: 1,
        rowVerticalPaddingScale: 1.1,

        // 테두리 설정
        borderRadius: 8,
        wrapperBorderRadius: 8,
        wrapperBorder: true,
        rowBorder: true,
        columnBorder: false,
        headerRowBorder: true,
        sidePanelBorder: true,

        // 브라우저 색상 스키마
        browserColorScheme: "dark",

        chromeBackgroundColor: {
            ref: "backgroundColor"
        },
    });