# 가계부 관리 화면

MUI X Data Grid를 사용한 가계부 관리 화면입니다. MongoDB와 연동하여 CRUD 기능을 제공합니다.

## 기능

### ✅ CRUD 기능
- **Create (생성)**: 행 추가 버튼으로 새로운 가계부 항목 생성
- **Read (조회)**: MongoDB에서 데이터 조회 및 표시
- **Update (수정)**: 행 편집 기능으로 데이터 수정
- **Delete (삭제)**: 행 삭제 기능으로 데이터 삭제

### 📊 주요 필드
- **날짜**: 거래 날짜
- **분류**: 수입/지출/이동
- **대분류**: 주요 카테고리
- **소분류**: 세부 카테고리
- **금액**: 거래 금액 (자동 천단위 구분)
- **계좌**: 사용 계좌
- **메모**: 거래 메모

### 🔍 검색 기능
- 날짜별 검색
- 분류별 검색
- 메모 검색

## 기술 스택

- **Frontend**:
  - Next.js 15
  - React 19
  - MUI X Data Grid
  - TypeScript

- **Backend**:
  - Next.js API Routes
  - MongoDB

- **UI Components**:
  - shadcn/ui (Button, Input 등)
  - GridSearchArea (공통 검색 컴포넌트)

## 사용 방법

### 1. 페이지 접근
```
/household-ledger
```

### 2. 데이터 추가
1. "행 추가" 버튼 클릭
2. 편집 모드에서 각 필드 입력
3. 저장 아이콘(✓) 클릭하여 저장

### 3. 데이터 수정
1. 수정할 행의 편집 아이콘(✎) 클릭
2. 필드 수정
3. 저장 아이콘(✓) 클릭

### 4. 데이터 삭제
1. 삭제할 행의 삭제 아이콘(🗑) 클릭
2. 확인

### 5. 검색
1. 상단 검색 영역에서 조건 입력
2. "조회" 버튼 클릭
3. "초기화" 버튼으로 검색 조건 초기화

## API 엔드포인트

### GET /api/household-ledger
전체 가계부 데이터 조회
```typescript
Response: {
  success: boolean;
  data: Array<{
    _id: string;
    date: string;
    category: string;
    mainCategory: string;
    subCategory: string;
    amount: number;
    account: string;
    memo: string;
  }>;
}
```

### POST /api/household-ledger
데이터 생성 또는 수정
```typescript
Request: Array<{
  _id?: string;  // 없으면 생성, 있으면 수정
  date: string;
  category: string;
  mainCategory: string;
  subCategory: string;
  amount: number;
  account: string;
  memo: string;
}>

Response: {
  success: boolean;
  data: null;
}
```

### DELETE /api/household-ledger
데이터 삭제
```typescript
Request: Array<{
  _id: string;
}>

Response: {
  success: boolean;
  data: null;
}
```

## MongoDB 컬렉션 구조

**Database**: `shadcn`
**Collection**: `household-ledger`

```javascript
{
  _id: ObjectId,
  date: String,          // ISO 날짜 형식
  category: String,      // "수입" | "지출" | "이동"
  mainCategory: String,  // 대분류
  subCategory: String,   // 소분류
  amount: Number,        // 금액
  account: String,       // 계좌
  memo: String          // 메모
}
```

## 알림 (Toast)

- 성공: 데이터 조회, 저장, 삭제 성공 시
- 에러: 작업 실패 시
- 정보: 검색 등 일반 정보

## 커스터마이징

### 페이지네이션 옵션 변경
```typescript
pageSizeOptions={[10, 25, 50, 100]}
```

### 컬럼 추가/수정
`columns` 배열에 새로운 `GridColDef` 객체 추가:
```typescript
{
  field: 'newField',
  headerName: '새 필드',
  width: 150,
  editable: true,
}
```

### 검색 필드 추가
`searchFields` 배열에 새로운 `SearchField` 추가:
```typescript
{
  label: '새 검색 필드',
  component: <Input ... />
}
```

## 향후 개선 사항

- [ ] 실제 검색 기능 구현 (현재는 placeholder)
- [ ] 대분류/소분류 드롭다운 연동
- [ ] 금액 합계 통계 표시
- [ ] 엑셀 export/import 기능
- [ ] 차트 연동 (월별 수입/지출)
- [ ] 필터링 기능 강화
