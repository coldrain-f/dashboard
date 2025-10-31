import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { CommonCodeManagementGrid } from "@/app/common/code-management/grid/grid-code"
import { CommonCodeGroupManagementGrid } from "./grid/grid-code-group"
import { CommonCodeManagementSearchForm } from "./grid/search-form"

export default async function Page() {

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
              <div className="px-6 mb-16">
                <CommonCodeManagementSearchForm />
              </div>
              <div className="grid grid-cols-[2fr_3fr] gap-5">
                {/* 상위 코드 */}
                <div className="ps-6">

                  <CommonCodeGroupManagementGrid />
                </div>

                {/* 하위 코드 */}
                <div className="pr-6">
                  <div className="flex justify-between">
                    <div>
                      {/* <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                        하위 코드
                      </h4> */}
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
                          border: 'solid 2px #f26522'
                        }} />
                        <div>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            하위 코드
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mb-2">
                      <Button variant={"outline"} size={"sm"} className="cursor-pointer">행 추가</Button>
                      <Button variant={"outline"} size={"sm"} className="cursor-pointer">행 삭제</Button>
                      <Button variant={"default"} size={"sm"} className="cursor-pointer">저장</Button>
                    </div>
                  </div>
                  <CommonCodeManagementGrid />
                </div>
              </div>
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
