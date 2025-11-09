'use client';
import DataGridDualLayout, { GRID_RATIOS } from "@/components/common/layouts/data-grid-dual-layout";
import MainLayout from "@/components/common/layouts/main-layout";
import DataGridHeader from "@/components/common/ui/data-grid-header";
import { DataGridSearchSection } from "@/components/common/ui/data-grid-search-section";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";

export default function Page() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const searchFields = [
    {
      label: '그룹코드',
      component: (
        <Input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="내용을 입력하세요."
        />
      )
    },
    {
      label: '그룹코드명',
      component: (
        <Input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="내용을 입력하세요."
        />
      )
    },
    {
      label: '사용여부',
      component: (
        <RadioGroup defaultValue="comfortable" className="flex flex-row gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="r1" />
            <Label htmlFor="r1">전체</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id="r2" />
            <Label htmlFor="r2">사용</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id="r3" />
            <Label htmlFor="r3">미사용</Label>
          </div>
        </RadioGroup>
      )
    },
  ]

  return (
    <MainLayout title="공통 코드 관리">
      <DataGridSearchSection
        fields={searchFields}
        onSearch={() => console.log({ userName, userEmail })}
        onReset={() => {
          setUserName('')
          setUserEmail('')
        }}
      />
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
