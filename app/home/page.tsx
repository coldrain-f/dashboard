'use client';
import DataGridDualLayout, { GRID_RATIOS } from "@/components/common/layouts/data-grid-dual-layout";
import MainLayout from "@/components/common/layouts/main-layout";
import DataGridHeader from "@/components/common/ui/data-grid-header";

export default function Page() {
  return (
    <MainLayout title="공통 코드 관리">
      <DataGridDualLayout gridRatio={GRID_RATIOS.LEFT_EMPHASIS}>
        <div>
          <DataGridHeader title="코드 그룹 목록" />
        </div>
        <div>
          <DataGridHeader title="코드 목록" />
        </div>
      </DataGridDualLayout>
    </MainLayout>
  )
}
