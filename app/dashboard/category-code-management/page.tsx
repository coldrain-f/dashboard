'use client';
import MainLayout from "@/components/common/layouts/main-layout";
import { DataGridSearchSection } from "@/components/common/ui/data-grid-search-section";
import { useState } from "react";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";
import DataGridSingleLayout from "@/components/common/layouts/data-grid-single-layout";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LyteNyteSampleGrid from "./grids/grid";
import DataGridDualLayout from "@/components/common/layouts/data-grid-dual-layout";
import { MajorCategoryGrid } from "./grids/grid-code-group";
import ShadcnAgGrid from "./grids/grid-claude";
import DataGridHeader from "@/components/common/ui/data-grid-header";

export default function Page() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const searchFields = [

    {
      label: '카테고리',
      component: (
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="선택해주세요." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>카테고리</SelectLabel>
              <SelectItem value="Housing">주거비</SelectItem>
              <SelectItem value="Finance">금융</SelectItem>
              <SelectItem value="Insurance">보험</SelectItem>
              <SelectItem value="Telecom">통신비</SelectItem>
              <SelectItem value="Transportation">교통비</SelectItem>
              <SelectItem value="Subscription">구독료</SelectItem>
              <SelectItem value="Others">기타</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    },
  ]

  return (
    <MainLayout title="분류코드 관리">
      <DataGridSearchSection
        fields={searchFields}
        onSearch={() => console.log({ userName, userEmail })}
        onReset={() => {
          setUserName('')
          setUserEmail('')
        }}
      />


      <div className="mb-10"></div>
      <DataGridDualLayout>
        <div>
          <DataGridHeader title="대분류" />
          <MajorCategoryGrid />
          {/* <ShadcnAgGrid /> */}
        </div>
        <div>

          <ShadcnAgGrid />

        </div>
      </DataGridDualLayout>
    </MainLayout>
  )
}
