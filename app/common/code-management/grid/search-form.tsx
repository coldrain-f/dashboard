'use client';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { GridSearchArea, SearchField } from "@/components/common/grid-search-area";

export function CommonCodeManagementSearchForm() {
    const [codeValue, setCodeValue] = useState("");
    const [codeNameValue, setCodeNameValue] = useState("");

    // 검색 필드 정의
    const searchFields: SearchField[] = [
        {
            label: "코드",
            component: (
                <Input
                    type="text"
                    placeholder=""
                    autoComplete="off"
                    style={{ backgroundColor: '#ffffff' }}
                    value={codeValue}
                    onChange={(e) => setCodeValue(e.target.value)}
                />
            ),
        },
        {
            label: "코드명",
            component: (
                <Input
                    type="text"
                    placeholder=""
                    autoComplete="off"
                    style={{ backgroundColor: '#ffffff' }}
                    value={codeNameValue}
                    onChange={(e) => setCodeNameValue(e.target.value)}
                />
            ),
        },
    ];

    // 조회 버튼 핸들러
    const handleSearch = () => {
        console.log("검색:", { code: codeValue, codeName: codeNameValue });
        // TODO: 실제 검색 로직 구현
    };

    // 초기화 버튼 핸들러
    const handleReset = () => {
        setCodeValue("");
        setCodeNameValue("");
        console.log("초기화됨");
    };

    return (
        <GridSearchArea
            title="공통 코드 관리"
            fields={searchFields}
            onSearch={handleSearch}
            onReset={handleReset}
            columns={4}
        />
    );
}
