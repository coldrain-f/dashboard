'use client';
import MainLayout from "@/components/common/layouts/main-layout";
import { useState } from "react";
import DataGridDualLayout, { GRID_RATIOS } from "@/components/common/layouts/data-grid-dual-layout";
import ExpenseGrid from "./grids/expense-grid";
import IncomeGrid from "./grids/Income-grid";
import DataGridSingleLayout from "@/components/common/layouts/data-grid-single-layout";


export default function Page() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')


  return (
    <MainLayout title="가계부">

      <DataGridSingleLayout>

        <ExpenseGrid />
      </DataGridSingleLayout>

    </MainLayout>
  )
}
