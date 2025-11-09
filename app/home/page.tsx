'use client';
import DataGridDualLayout, { GRID_RATIOS } from "@/components/common/layouts/data-grid-dual-layout";
import MainLayout from "@/components/common/layouts/main-layout";
import DataGridHeader from "@/components/common/ui/data-grid-header";

export default function Page() {
  return (
    <MainLayout>
      <DataGridDualLayout gridRatio={GRID_RATIOS.LEFT_EMPHASIS}>
        {/* 왼쪽 그리드 */}
        <div>
          <DataGridHeader title="상위 코드 관리" />
          {/* 여기에 상위 코드 그리드 컴포넌트 추가 */}
        </div>

        {/* 오른쪽 그리드 */}
        <div>
          <DataGridHeader title="하위 코드 관리" />
          {/* 여기에 하위 코드 그리드 컴포넌트 추가 */}
        </div>
      </DataGridDualLayout>
    </MainLayout>
  )
}
