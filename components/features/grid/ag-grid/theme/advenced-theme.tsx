import { themeQuartz } from 'ag-grid-community';

export const advencedTheme = themeQuartz
    .withParams({
        accentColor: "#555B62",
        backgroundColor: "#FFFFFF",
        borderColor: "#CACACA",
        borderRadius: 2,
        browserColorScheme: "light",
        cellHorizontalPaddingScale: 0.7,
        chromeBackgroundColor: {
            ref: "backgroundColor"
        },
        columnBorder: true,
        fontSize: 12,
        foregroundColor: "#555B62",
        headerBackgroundColor: "#EEEEEE", // #fafafb
        headerFontSize: 12,
        headerFontWeight: 400,
        // headerTextColor: "#84868B",
        headerRowBorder: true,
        headerTextColor: "#1E2939",
        rowBorder: true,
        rowVerticalPaddingScale: 0.8,
        sidePanelBorder: true,
        spacing: 6,
        wrapperBorder: true,
        wrapperBorderRadius: 2
    });