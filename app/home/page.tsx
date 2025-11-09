'use client';
import { AppSidebar } from "@/components/app-sidebar"
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="py-6">
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-[2fr_3fr] gap-5">
                  <DataGridHeader
                    title="코드 그룹"
                  />

                  <DataGridHeader
                    title="코드 상세"
                  />
                </div>

              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
