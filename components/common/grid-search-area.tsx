'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface SearchField {
  label: string;
  component: ReactNode;
}

export interface GridSearchAreaProps {
  /** 검색 영역 제목 (옵션) */
  title?: string;
  /** 검색 필드 배열 */
  fields: SearchField[];
  /** 조회 버튼 클릭 핸들러 */
  onSearch: () => void;
  /** 초기화 버튼 클릭 핸들러 */
  onReset: () => void;
  /** 그리드 컬럼 수 (기본값: 4) */
  columns?: number;
  /** 조회 버튼 텍스트 (기본값: "조회") */
  searchButtonText?: string;
  /** 초기화 버튼 텍스트 (기본값: "초기화") */
  resetButtonText?: string;
}

/**
 * Grid 검색 영역 공통 컴포넌트
 *
 * @example
 * ```tsx
 * <GridSearchArea
 *   title="공통 코드 관리"
 *   fields={[
 *     { label: "코드", component: <Input /> },
 *     { label: "코드명", component: <Input /> }
 *   ]}
 *   onSearch={() => console.log('조회')}
 *   onReset={() => console.log('초기화')}
 * />
 * ```
 */
export function GridSearchArea({
  title,
  fields,
  onSearch,
  onReset,
  columns = 4,
  searchButtonText = '조회',
  resetButtonText = '초기화',
}: GridSearchAreaProps) {
  return (
    <div>
      {/* 제목 영역 */}
      {title && (
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div
            style={{
              display: 'inline-block',
              verticalAlign: 'top',
              margin: '7px 7px 8px 0px',
              height: '7px',
              width: '7px',
              border: 'solid 2px #f26522',
            }}
          />
          <div>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {title}
            </span>
          </div>
        </div>
      )}

      {/* 검색 필드 및 버튼 영역 */}
      <div
        style={{
          display: 'grid',
          rowGap: '8px',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          backgroundColor: '#F5F7FA',
          padding: '7px',
          borderTop: '1px solid #d3d4d6',
          borderBottom: '1px solid #d3d4d6',
          position: 'relative',
        }}
      >
        {/* 검색 필드들 */}
        {fields.map((field, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <Label
              style={{
                whiteSpace: 'nowrap',
                color: '#555555',
                fontSize: '13px',
                marginLeft: '20px',
                marginRight: '50px',
                minWidth: '60px',
              }}
            >
              {field.label}
            </Label>
            <div style={{ flex: 1 }}>{field.component}</div>
          </div>
        ))}

        {/* 버튼 영역 - 마지막 컬럼에 배치 */}
        <div
          style={{
            gridColumn: columns,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '10px',
          }}
        >
          <Button onClick={onSearch} size="sm">
            {searchButtonText}
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            {resetButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
