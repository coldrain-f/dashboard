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
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import { toast } from 'sonner';

type RowState = 'ORIGINAL' | 'NEW' | 'MODIFIED' | 'DELETED';

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
  _state?: RowState;
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
        const rowsWithState = (jsonData.data || []).map((row: HouseholdLedgerRow) => ({
          ...row,
          _state: 'ORIGINAL' as RowState,
        }));
        setRows(rowsWithState);
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
      _state: 'NEW',
    };

    setRows((oldRows) => [newRow, ...oldRows]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'date' },
    }));
    toast.success('신규 행이 추가되었습니다.');
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
    if (row.isNew || row._state === 'NEW') {
      setRows(rows.filter((r) => r._id !== id));
      toast.success('행이 삭제되었습니다.');
      return;
    }

    // 기존 행은 삭제 상태로 표시
    const updatedRows = rows.map((r) =>
      r._id === id ? { ...r, _state: 'DELETED' as RowState } : r
    );
    setRows(updatedRows);
    toast.success('삭제 표시되었습니다. 저장 버튼을 눌러 확정하세요.');
  };

  // 실제 저장 (상태에 따라 처리)
  const saveAllChanges = async () => {
    const newRows = rows.filter((row) => row._state === 'NEW');
    const modifiedRows = rows.filter((row) => row._state === 'MODIFIED');
    const deletedRows = rows.filter((row) => row._state === 'DELETED');

    try {
      setLoading(true);

      // 신규 데이터 저장
      if (newRows.length > 0) {
        await fetch('/api/household-ledger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            newRows.map((row) => {
              const { _id, _state, isNew, ...cleanRow } = row;
              return cleanRow;
            })
          ),
        });
      }

      // 수정된 데이터 업데이트
      if (modifiedRows.length > 0) {
        await fetch('/api/household-ledger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            modifiedRows.map((row) => {
              const { _state, isNew, ...cleanRow } = row;
              return cleanRow;
            })
          ),
        });
      }

      // 삭제된 데이터 처리
      if (deletedRows.length > 0) {
        await fetch('/api/household-ledger', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deletedRows),
        });
      }

      toast.success('저장을 완료했습니다.');
      await fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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

  // 셀 값 변경 시 상태 업데이트
  const handleCellEditStart = (params: any) => {
    const row = rows.find((r) => r._id === params.id);
    if (row && row._state !== 'NEW' && row._state !== 'MODIFIED') {
      const updatedRows = rows.map((r) =>
        r._id === params.id ? { ...r, _state: 'MODIFIED' as RowState } : r
      );
      setRows(updatedRows);
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

  // 상태 렌더러
  const renderState = (params: any) => {
    const state = params.row._state;
    if (!state || state === 'ORIGINAL') return null;

    const getStateInfo = (state: RowState) => {
      switch (state) {
        case 'NEW':
          return { text: '신규', className: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'MODIFIED':
          return { text: '수정', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'DELETED':
          return { text: '삭제', className: 'bg-red-100 text-red-800 border-red-200' };
        default:
          return { text: '', className: '' };
      }
    };

    const stateInfo = getStateInfo(state);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${stateInfo.className}`}>
        {stateInfo.text}
      </span>
    );
  };

  // 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: '_state',
      headerName: '상태',
      width: 80,
      renderCell: renderState,
      editable: false,
      sortable: false,
      filterable: false,
    },
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
      {/* 헤더 */}
      <div className="flex justify-between mb-1">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          가계부 관리
        </h4>
      </div>
      <Separator className="mb-5" />

      {/* Toaster */}
      <Toaster richColors={true} position="top-right" closeButton={false} />

      {/* 검색 영역 */}
      <GridSearchArea
        title="가계부 관리"
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleReset}
        columns={4}
      />

      {/* 버튼 영역 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2, mt: 3 }}>
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
            border: 'solid 2px #999999'
          }} />
          <div>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              가계부 기록
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="cursor-pointer gap-2"
          >
            <RefreshIcon fontSize="small" />
            새로고침
          </Button>
          <Button
            onClick={handleAddClick}
            variant="outline"
            size="sm"
            className="cursor-pointer gap-2"
          >
            <AddIcon fontSize="small" />
            행 추가
          </Button>
          <Button
            onClick={saveAllChanges}
            variant="default"
            size="sm"
            className="cursor-pointer gap-2"
          >
            <SaveIcon fontSize="small" />
            저장
          </Button>
        </div>
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
          onCellEditStart={handleCellEditStart}
          processRowUpdate={processRowUpdate}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 100, page: 0 },
            },
          }}
          pageSizeOptions={[100, 500, 1000]}
          disableRowSelectionOnClick
          sx={{
            // 전체 테두리
            border: '1px solid #CACACA',
            borderRadius: '2px',

            // 헤더 스타일
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#EEEEEE',
              borderBottom: '1px solid #CACACA',
              minHeight: '42px !important',
              maxHeight: '42px !important',
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: '12px',
              fontWeight: 400,
              color: '#1E2939',
              borderRight: '1px solid #CACACA',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '12px',
              fontWeight: 400,
            },

            // 셀 스타일
            '& .MuiDataGrid-cell': {
              fontSize: '12px',
              color: '#555B62',
              borderRight: '1px solid #CACACA',
              borderBottom: '1px solid #CACACA',
              padding: '6px 8px',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },

            // 행 스타일
            '& .MuiDataGrid-row': {
              minHeight: '38px !important',
              maxHeight: '38px !important',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },

            // 상태별 행 배경색
            '& .MuiDataGrid-row[data-state="NEW"]': {
              backgroundColor: 'rgba(239, 246, 255, 0.6)',
            },
            '& .MuiDataGrid-row[data-state="MODIFIED"]': {
              backgroundColor: 'rgba(254, 252, 232, 0.6)',
            },
            '& .MuiDataGrid-row[data-state="DELETED"]': {
              backgroundColor: 'rgba(254, 242, 242, 0.6)',
              opacity: 0.7,
            },

            // 푸터 스타일
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #CACACA',
              backgroundColor: '#FFFFFF',
            },

            // 페이지네이션
            '& .MuiTablePagination-root': {
              fontSize: '12px',
            },

            // 체크박스 스타일
            '& .MuiCheckbox-root': {
              color: '#555B62',
            },
          }}
          getRowClassName={(params) => {
            const state = params.row._state;
            return state ? `data-state-${state}` : '';
          }}
        />
      </Box>
    </div>
  );
}
