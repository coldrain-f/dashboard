'use client';
import { AppSidebar } from "@/components/app-sidebar"
import DataGridDualLayout, { GRID_RATIOS } from "@/components/common/layouts/data-grid-dual-layout";
import DataGridHeader from "@/components/common/ui/data-grid-header";

import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"


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
        <DataGridDualLayout gridRatio={GRID_RATIOS.LEFT_EMPHASIS}>
          <DataGridHeader title="코드 그룹" />
          <DataGridHeader title="코드" />
        </DataGridDualLayout>
      </SidebarInset>
    </SidebarProvider>
  )
}
