'use client';

import "@1771technologies/lytenyte-pro/grid.css";
import type {
    Grid as G,
    RowLayout,
    RowNormalRowLayout,
    Column,
    CellRendererParams,
    HeaderCellRendererParams,
    SortModelItem,
    SortComparatorFn,
} from "@1771technologies/lytenyte-pro/types";
import { Grid, useClientRowDataSource } from "@1771technologies/lytenyte-pro";
import { memo, useId, type ReactNode } from "react";

import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowDownIcon, ArrowUpIcon, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
function tw(...c: ClassValue[]) {
    return twMerge(clsx(...c));
}

// Renderer
const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
});

export function NumberCell({ grid, row, column }: CellRendererParams<any>) {
    const field = grid.api.columnField(column, row);

    return typeof field === "number" ? formatter.format(field) : `${field ?? "-"}`;
}

export function InputCell({ grid, row, column }: CellRendererParams<RequestData>) {
    const field = grid.api.columnField(column, row);

    return (
        <Input type="" value={field as string} onChange={() => { }} />
    )
}

export function StatusCell({ column, row, grid }: CellRendererParams<RequestData>) {
    const status = grid.api.columnField(column, row);

    // Guard against bad values
    if (typeof status !== "number") return null;

    return (
        <div className={clsx("flex h-full w-full items-center px-4 text-xs font-bold")}>
            <div
                className={clsx(
                    "rounded-sm px-1 py-px",
                    status < 400 && "text-ln-primary-50 bg-[#126CFF1F]",
                    status >= 400 && status < 500 && "bg-[#FF991D1C] text-[#EEA760]",
                    status >= 500 && "bg-[#e63d3d2d] text-[#e63d3d]",
                )}
            >
                {status}
            </div>
        </div>
    );
}

export function LyteNyte<T>({ grid }: { grid: G<T> }) {
    const view = grid.view.useValue();

    return (
        <div className="lng-grid lng1771-shadcn h-full w-full">
            <Grid.Root grid={grid}>
                <Grid.Viewport>
                    <Grid.Header>
                        {view.header.layout.map((headerRow, i) => {
                            return (
                                <Grid.HeaderRow headerRowIndex={i} key={i}>
                                    {headerRow.map((headerCell) => {
                                        if (headerCell.kind === "group")
                                            return (
                                                <Grid.HeaderGroupCell cell={headerCell} key={headerCell.idOccurrence} />
                                            );

                                        return (
                                            <Grid.HeaderCell
                                                className="flex items-center px-2 text-sm bold font-medium bg-stone-800"
                                                cell={headerCell}
                                                key={headerCell.id}
                                            />
                                        );
                                    })}
                                </Grid.HeaderRow>
                            );
                        })}
                    </Grid.Header>
                    <Grid.RowsContainer>
                        <Grid.RowsTop>
                            <RowHandler rows={view.rows.top} />
                        </Grid.RowsTop>
                        <Grid.RowsCenter>
                            {view.rows.center.map((row) => {

                                if (row.kind === "full-width") {
                                    return null;
                                }

                                return (
                                    <Grid.Row row={row} key={row.id}>
                                        {row.cells.map((c) => {
                                            return (
                                                <Grid.Cell
                                                    key={c.id}
                                                    cell={c}
                                                    className={tw(
                                                        "flex items-center px-2 text-sm bg-stone-700",
                                                        c.column.type === "number" && "justify-end tabular-nums",
                                                    )}
                                                />
                                            );
                                        })}
                                    </Grid.Row>
                                );
                            })}
                        </Grid.RowsCenter>
                        <Grid.RowsBottom>
                            <RowHandler rows={view.rows.bottom} />
                        </Grid.RowsBottom>
                    </Grid.RowsContainer>
                </Grid.Viewport>
            </Grid.Root>
        </div>
    );
}

const RowHandler = <T,>(props: { rows: RowLayout<T>[] }) => {
    return props.rows.map((row) => {
        if (row.kind === "full-width") return <Grid.RowFullWidth key={row.id} row={row} />;

        return <Row key={row.id} row={row} />;
    });
};
function RowImpl<T>({ row }: { row: RowNormalRowLayout<T> }) {
    return (
        <Grid.Row key={row.id} row={row}>
            {row.cells.map((cell) => {
                return <Grid.Cell className="flex items-center px-2" cell={cell} key={cell.id} />;
            })}
        </Grid.Row>
    );
}

const Row = memo(RowImpl) as <T>(props: { row: RowNormalRowLayout<T> }) => ReactNode;

type RequestData = {
    code: string;
    codeName: string;
    isActive: boolean;
};

const columns: Column<RequestData>[] = [
    { id: "code", name: "코드" },
    { id: "codeName", name: "코드명", type: "string"},
    { id: "isActive", name: "사용 여부" },
];


export default function LyteNyteSampleGrid() {
    const ds = useClientRowDataSource({
        data: [
            {
                code: "A1000",
                codeName: "수입 분류",
                isActive: true,
            },
            {
                code: "A1100",
                codeName: "지출 분류",
                isActive: true,
            },
            
        ],
    });
    const grid = Grid.useLyteNyte({
        gridId: useId(),
        rowDataSource: ds,
        columns,
        columnBase: {
            width: 150,
        },
        cellSelectionMode: "range",
        rowSelectedIds: new Set(["0-center", "1-center"]),
        cellSelections: [{ rowStart: 4, rowEnd: 7, columnStart: 2, columnEnd: 4 }],

        rowSelectionMode: "multiple",
        rowSelectionActivator: "none",
        columnMarkerEnabled: true,
        columnMarker: {
            headerRenderer: ({ grid }) => {
                let isSelected = false;
                return (
                    <div>
                        <div className="flex h-full w-full items-center justify-center">

                            <Checkbox checked={isSelected} onCheckedChange={(checked) => {
                                if (checked) {
                                    grid.api.rowSelectAll();
                                    isSelected = true;
                                } else {
                                    isSelected = false;
                                }
                            }}
                            />

                        </div>
                    </div>
                );
            },
            cellRenderer: ({ rowSelected, grid }) => {
                return (
                    <div>
                        <div className="flex h-full w-full items-center justify-center">
                            <Checkbox checked={rowSelected} onChange={() => { }} onClick={(e) => {
                                e.stopPropagation();
                                grid.api.rowHandleSelect({
                                    target: e.currentTarget,
                                    shiftKey: e.shiftKey,
                                });
                            }}
                            />
                        </div>
                    </div>
                );
            },
        },
    });

    return (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <div style={{ height: "335px", width: "100%" }}>
                <LyteNyte grid={grid} />
            </div>
        </div>
    );
}
