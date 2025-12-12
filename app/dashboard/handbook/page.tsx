'use client';
import MainLayout from "@/components/common/layouts/main-layout";
import { useState } from "react";
import DataGridDualLayout, { GRID_RATIOS } from "@/components/common/layouts/data-grid-dual-layout";
import ExpenseGrid from "./grids/expense-grid";
import IncomeGrid from "./grids/Income-grid";


export default function Page() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')


  return (
    <MainLayout title="가계부">

      <DataGridDualLayout gridRatio={GRID_RATIOS.EQUAL} >
        <ExpenseGrid />
        <IncomeGrid />
      </DataGridDualLayout>

    </MainLayout>
  )
}
