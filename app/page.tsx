'use client';


import "@1771technologies/lytenyte-pro/grid.css";
import type {
  Grid as G,
  RowLayout,
  RowNormalRowLayout,
  Column,
} from "@1771technologies/lytenyte-pro/types";
import { Grid, useClientRowDataSource } from "@1771technologies/lytenyte-pro";
import { memo, useId, type ReactNode } from "react";

export function LyteNyte<T>({ grid }: { grid: G<T> }) {
  const view = grid.view.useValue();

  return (
    // lng1771-shadcn 
    <div className="lng-grid lng1771-teal h-full w-full">
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
                        className="flex items-center px-2"
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
              <RowHandler rows={view.rows.center} />
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


// 
type RequestData = {
  Date: string;
  Status: number;
  Method: string;
  Pathname: string;
  Latency: number;
  "region.shortname": string;
  "region.fullname": string;
  "timing-phase.dns": number;
  "timing-phase.tls": number;
  "timing-phase.ttfb": number;
  "timing-phase.connection": number;
  "timing-phase.transfer": number;
};

const columns: Column<RequestData>[] = [
  { id: "Date", name: "Date", type: "datetime" },
  { id: "Status", name: "Status" },
  { id: "Method", name: "Method" },
  { id: "timing-phase", name: "Timing Phase" },
  { id: "Pathname", name: "Pathname" },
  { id: "Latency", name: "Latency" },
  { id: "region", name: "Region" },
];

export default function Home() {
  const ds = useClientRowDataSource({
    data: [
      {
        Date: "2024-06-01T12:00:00Z",
        Status: 200,
        Method: "GET",
        Pathname: "/api/data",
        Latency: 120,
        "region.shortname": "us",
        "region.fullname": "United States",
        "timing-phase.dns": 20,
        "timing-phase.tls": 30,
        "timing-phase.ttfb": 40,
        "timing-phase.connection": 15,
        "timing-phase.transfer": 15,
      },
      {
        Date: "2024-06-01T12:05:00Z",
        Status: 404,
        Method: "POST",
        Pathname: "/api/submit",
        Latency: 150,
        "region.shortname": "eu",
        "region.fullname": "Europe",
        "timing-phase.dns": 25,
        "timing-phase.tls": 35,
        "timing-phase.ttfb": 45,
        "timing-phase.connection": 20,
        "timing-phase.transfer": 25,
      },
    ] as RequestData[]
  });
  const grid = Grid.useLyteNyte({
    gridId: useId(),
    rowDataSource: ds,
    columns,
    cellSelectionMode: "range",
  });




  return (

    <div style={{ height: "400px", width: "100%" }}>
      <LyteNyte
        grid={grid}
      />
    </div>

  );
}
