'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { Button } from '@/components/ui/button';
import { GridSearchArea, SearchField } from '@/components/common/grid-search-area';
import { Input } from '@/components/ui/input';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { toast } from 'sonner';

interface HouseholdLedgerRow {
  _id?: string;
  date: string;
  category: string;
  mainCategory: string;
  subCategory: string;
  amount: number;
  account: string;
  memo: string;
  isNew?: boolean;
}

export default function HouseholdLedgerPage() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [loading, setLoading] = useState(true);

  // 검색 필터 state
  const [searchDate, setSearchDate] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchMemo, setSearchMemo] = useState('');

  // 데이터 조회
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/household-ledger', { method: 'GET' });
      const jsonData = await res.json();

      if (jsonData.success) {
        setRows(jsonData.data || []);
        toast.success('데이터를 불러왔습니다.');
      } else {
        toast.error('데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 행 추가
  const handleAddClick = () => {
    const id = `new-${Date.now()}`;
    const newRow: HouseholdLedgerRow = {
      _id: id,
      date: new Date().toISOString().split('T')[0],
      category: '지출',
      mainCategory: '',
      subCategory: '',
      amount: 0,
      account: '',
      memo: '',
      isNew: true,
    };

    setRows((oldRows) => [newRow, ...oldRows]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'date' },
    }));
  };

  // 행 수정
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  // 행 저장
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  // 행 삭제
  const handleDeleteClick = (id: GridRowId) => async () => {
    const row = rows.find((r) => r._id === id);

    if (!row) return;

    // 신규 행인 경우 바로 삭제
    if (row.isNew) {
      setRows(rows.filter((r) => r._id !== id));
      toast.success('행이 삭제되었습니다.');
      return;
    }

    // DB에서 삭제
    try {
      const res = await fetch('/api/household-ledger', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([row]),
      });

      if (res.ok) {
        setRows(rows.filter((r) => r._id !== id));
        toast.success('삭제되었습니다.');
      } else {
        toast.error('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  // 행 취소
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row._id === id);
    if (editedRow?.isNew) {
      setRows(rows.filter((row) => row._id !== id));
    }
  };

  // 행 업데이트 처리
  const processRowUpdate = async (newRow: GridRowModel) => {
    try {
      const rowToSave = { ...newRow };

      // 신규 행인 경우 _id를 undefined로 설정하여 서버에서 새로 생성되도록 함
      if (rowToSave.isNew) {
        delete rowToSave._id;
        delete rowToSave.isNew;
      }

      const res = await fetch('/api/household-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([rowToSave]),
      });

      if (res.ok) {
        toast.success('저장되었습니다.');
        await fetchData(); // 데이터 새로고침
        return newRow;
      } else {
        toast.error('저장에 실패했습니다.');
        return newRow;
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
      return newRow;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // 검색 기능
  const handleSearch = () => {
    toast.info('검색 기능은 구현 예정입니다.');
  };

  // 초기화 기능
  const handleReset = () => {
    setSearchDate('');
    setSearchCategory('');
    setSearchMemo('');
    fetchData();
  };

  // 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'actions',
      type: 'actions',
      headerName: '작업',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
    {
      field: 'date',
      headerName: '날짜',
      width: 130,
      editable: true,
      type: 'date',
      valueGetter: (value) => value ? new Date(value) : null,
    },
    {
      field: 'category',
      headerName: '분류',
      width: 100,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['수입', '지출', '이동'],
    },
    {
      field: 'mainCategory',
      headerName: '대분류',
      width: 120,
      editable: true,
    },
    {
      field: 'subCategory',
      headerName: '소분류',
      width: 120,
      editable: true,
    },
    {
      field: 'amount',
      headerName: '금액',
      width: 130,
      editable: true,
      type: 'number',
      valueFormatter: (value) => {
        if (value == null) return '';
        return new Intl.NumberFormat('ko-KR').format(value);
      },
    },
    {
      field: 'account',
      headerName: '계좌',
      width: 150,
      editable: true,
    },
    {
      field: 'memo',
      headerName: '메모',
      width: 250,
      editable: true,
    },
  ];

  // 검색 필드 정의
  const searchFields: SearchField[] = [
    {
      label: '날짜',
      component: (
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{ backgroundColor: '#ffffff' }}
        />
      ),
    },
    {
      label: '분류',
      component: (
        <Input
          type="text"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          placeholder="수입/지출/이동"
          style={{ backgroundColor: '#ffffff' }}
        />
      ),
    },
    {
      label: '메모',
      component: (
        <Input
          type="text"
          value={searchMemo}
          onChange={(e) => setSearchMemo(e.target.value)}
          placeholder="메모 검색"
          style={{ backgroundColor: '#ffffff' }}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 검색 영역 */}
      <GridSearchArea
        title="가계부 관리"
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleReset}
        columns={4}
      />

      {/* 버튼 영역 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
        <Button
          onClick={handleAddClick}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <AddIcon fontSize="small" />
          행 추가
        </Button>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
        >
          새로고침
        </Button>
      </Box>

      {/* MUI X Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Box>
    </div>
  );
}
