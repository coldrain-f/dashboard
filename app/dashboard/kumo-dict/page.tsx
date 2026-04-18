'use client';

import { useState } from 'react';
import MainLayout from '@/components/common/layouts/main-layout';
import { DataGridSearchSection } from '@/components/common/ui/data-grid-search-section';
import DataGridSingleLayout from '@/components/common/layouts/data-grid-single-layout';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import KumoDictGrid from './grids/grid';

export default function Page() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [bodySearchInput, setBodySearchInput] = useState('');
  const [bodySearch, setBodySearch] = useState('');
  const [missingKanji, setMissingKanji] = useState(false);

  const searchFields = [
    {
      label: '표제어',
      component: (
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setBodySearch(bodySearchInput); } }}
          placeholder="표제어를 입력하세요."
        />
      ),
    },
    {
      label: '내용',
      component: (
        <Input
          value={bodySearchInput}
          onChange={(e) => setBodySearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setBodySearch(bodySearchInput); } }}
          placeholder="내용을 입력하세요."
        />
      ),
    },
    {
      label: '필터',
      component: (
        <div className="flex items-center gap-2 h-9">
          <Checkbox
            id="missing-kanji"
            checked={missingKanji}
            onCheckedChange={(v) => setMissingKanji(!!v)}
          />
          <Label htmlFor="missing-kanji" className="cursor-pointer text-sm">
            한자 검색 누락 항목만 보기
          </Label>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="KUMO 사전 관리">
      <DataGridSearchSection
        fields={searchFields}
        onSearch={() => { setSearch(searchInput); setBodySearch(bodySearchInput); }}
        onReset={() => { setSearchInput(''); setSearch(''); setBodySearchInput(''); setBodySearch(''); setMissingKanji(false); }}
      />
      <DataGridSingleLayout>
        <KumoDictGrid search={search} bodySearch={bodySearch} missingKanji={missingKanji} />
      </DataGridSingleLayout>
    </MainLayout>
  );
}
