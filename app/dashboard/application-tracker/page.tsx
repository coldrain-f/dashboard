'use client';
import MainLayout from "@/components/common/layouts/main-layout";
import { DataGridSearchSection } from "@/components/common/ui/data-grid-search-section";
import { useState } from "react";

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
import ApplicationTrackerGrid from "./grids/grid";

export default function Page() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const searchFields = [

    {
      label: '상태',
      component: (
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="선택해주세요." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="InActive">InActive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    },
  ]

  return (
    <MainLayout title="지원 현황 관리">
      <DataGridSearchSection
        fields={searchFields}
        onSearch={() => console.log({ userName, userEmail })}
        onReset={() => {
          setUserName('')
          setUserEmail('')
        }}
      />


      <div className="mb-10"></div>
      <DataGridSingleLayout >
        <ApplicationTrackerGrid />
      </DataGridSingleLayout>

    </MainLayout>
  )
}
