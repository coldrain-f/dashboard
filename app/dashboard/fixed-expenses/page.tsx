'use client';
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
import DataGridSingleLayout from "@/components/common/layouts/data-grid-single-layout";
import { FixedExpensesGrid } from "./grids/grid";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FixedExpensesTotalGrid } from "./grids/calc-grid";

export default function Page() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const searchFields = [
    {
      label: '지출항목명',
      component: (
        <Input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="내용을 입력하세요."
        />
      )
    },
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
    {
      label: '결제수단',
      component: (
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="선택해주세요." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>결제수단</SelectLabel>
              <SelectItem value="Credit">신용카드</SelectItem>
              <SelectItem value="Debit">체크카드</SelectItem>
              <SelectItem value="Transfer">계좌이체</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    },
    {
      label: '결제계좌',
      component: (
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="선택해주세요." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>결제계좌</SelectLabel>
              <SelectItem value="hanabank">하나은행</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    },
    {
      label: '시작일',
      component: (
        <></>
      )
    },
    {
      label: '종료일',
      component: (
        <></>
      )
    },
    {
      label: '활성상태',
      component: (
        <RadioGroup defaultValue="all" className="flex flex-row gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="r1" className="cursor-pointer" />
            <Label htmlFor="r1">전체</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id="r2" className="cursor-pointer" />
            <Label htmlFor="r2">활성</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id="r3" className="cursor-pointer" />
            <Label htmlFor="r3">비활성</Label>
          </div>
        </RadioGroup>
      )
    },
  ]

  return (
    <MainLayout title="고정 지출 관리">
      <DataGridSearchSection
        fields={searchFields}
        onSearch={() => console.log({ userName, userEmail })}
        onReset={() => {
          setUserName('')
          setUserEmail('')
        }}
      />

      <DataGridSingleLayout>
        <DataGridHeader
          title="카테고리별 합산 금액"
          showAdd={false}
          showDelete={false}
          showSave={false}
          showReset={false}
        />
        <FixedExpensesTotalGrid />
      </DataGridSingleLayout>
      <div className="mb-4"></div>
      <DataGridSingleLayout>
        <DataGridHeader title="고정 지출 목록" />
        <FixedExpensesGrid />
      </DataGridSingleLayout>
    </MainLayout>
  )
}
