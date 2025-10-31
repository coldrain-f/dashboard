import { themeQuartz } from 'ag-grid-community';

export const basicTheme = themeQuartz
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
        fontSize: 12,
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