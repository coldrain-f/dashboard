# GridSearchArea 컴포넌트 사용 가이드

Grid 검색 영역을 위한 재사용 가능한 공통 컴포넌트입니다.

## 기본 사용법

```tsx
import { GridSearchArea, SearchField } from '@/components/common/grid-search-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

function MySearchForm() {
  const [searchValue, setSearchValue] = useState('');

  const fields: SearchField[] = [
    {
      label: '검색어',
      component: (
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      ),
    },
  ];

  return (
    <GridSearchArea
      title="검색 조건"
      fields={fields}
      onSearch={() => console.log('조회')}
      onReset={() => setSearchValue('')}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | No | - | 검색 영역 제목 |
| `fields` | `SearchField[]` | Yes | - | 검색 필드 배열 |
| `onSearch` | `() => void` | Yes | - | 조회 버튼 클릭 핸들러 |
| `onReset` | `() => void` | Yes | - | 초기화 버튼 클릭 핸들러 |
| `columns` | `number` | No | 4 | 그리드 컬럼 수 |
| `searchButtonText` | `string` | No | '조회' | 조회 버튼 텍스트 |
| `resetButtonText` | `string` | No | '초기화' | 초기화 버튼 텍스트 |

## SearchField 타입

```tsx
interface SearchField {
  label: string;      // 필드 라벨
  component: ReactNode; // Input, Dropdown 등의 컴포넌트
}
```

## 고급 사용 예제

### 여러 필드 사용

```tsx
import { GridSearchArea, SearchField } from '@/components/common/grid-search-area';
import { Input } from '@/components/ui/input';
import { Dropdown } from '@/components/dropdown';
import { useState } from 'react';

function AdvancedSearchForm() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  const fields: SearchField[] = [
    {
      label: '코드',
      component: (
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ backgroundColor: '#ffffff' }}
        />
      ),
    },
    {
      label: '코드명',
      component: (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ backgroundColor: '#ffffff' }}
        />
      ),
    },
    {
      label: '상태',
      component: <Dropdown />,
    },
  ];

  const handleSearch = () => {
    console.log({ code, name, status });
    // 실제 검색 API 호출
  };

  const handleReset = () => {
    setCode('');
    setName('');
    setStatus('');
  };

  return (
    <GridSearchArea
      title="상세 검색"
      fields={fields}
      onSearch={handleSearch}
      onReset={handleReset}
      columns={3}
    />
  );
}
```

### 제목 없이 사용

```tsx
<GridSearchArea
  fields={fields}
  onSearch={handleSearch}
  onReset={handleReset}
/>
```

### 커스텀 버튼 텍스트

```tsx
<GridSearchArea
  title="검색"
  fields={fields}
  onSearch={handleSearch}
  onReset={handleReset}
  searchButtonText="검색"
  resetButtonText="리셋"
/>
```

## 스타일 커스터마이징

컴포넌트 내부에서 사용하는 색상 및 스타일:
- 배경색: `#F5F7FA`
- 테두리: `#d3d4d6`
- 타이틀 포인트 컬러: `#f26522`
- 라벨 색상: `#555555`

필요한 경우 props로 전달하는 `component`에서 개별적으로 스타일을 지정할 수 있습니다.
