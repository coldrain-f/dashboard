import { AppSidebar } from "@/components/layout/app-sidebar"
import { ChartAreaInteractive } from "@/components/features/chart/chart-area-interactive"
import { DataTable } from "@/components/features/grid/data-table"
import { SectionCards } from "@/components/features/section/section-cards"
import { SiteHeader } from "@/components/layout/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Grid } from "@/components/features/grid/grid"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/components/features/search/search-from"
import { AnkiGrid } from "@/components/features/grid/grid-anki"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="theme-scaled"
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="py-6">
              <div className="px-6 mb-6">
                {/* <SearchForm /> */}
              </div>
              <div className="px-4 lg:px-6">

                <AnkiGrid />
              </div>
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
