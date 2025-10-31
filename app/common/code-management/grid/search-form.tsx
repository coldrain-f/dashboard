'use client';
import { useState } from "react";

import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
} from "@/components/ui/card"

import { Checkbox } from "@/components/ui/checkbox"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dropdown } from "@/components/features/common/dropdown";
import { Input } from "@/components/ui/input";
import { Repeat } from "lucide-react";


export function CommonCodeManagementSearchForm() {
    return (
        // <div>
        //     <Card className="@container/card">
        //         <CardHeader>
        //             <CardAction>
        //                 <div className="flex gap-2">
        //                     <Button>조회</Button>
        //                     <Button variant="outline">초기화</Button>
        //                 </div>
        //             </CardAction>
        //             <CardContent>

        //             </CardContent>
        //             <div className="grid grid-cols-4 gap-3">
        //                 <div className="flex max-w-xs items-center gap-5">
        //                     <Label htmlFor="email" className="min-w-16 whitespace-nowrap">코드</Label>
        //                     <Input type="email" id="email" placeholder="" autoComplete="off" />
        //                 </div>
        //                 <div className="flex max-w-xs items-center gap-5">
        //                     <Label htmlFor="email" className="min-w-16 whitespace-nowrap">코드명</Label>
        //                     <Input type="email" id="email" placeholder="" autoComplete="off" />
        //                 </div>
        //                 <div className="flex w-[400px] max-w-xs items-center gap-5">
        //                     <Label htmlFor="email" className="min-w-16 whitespace-nowrap">사용 여부</Label>
        //                     <Dropdown />
        //                 </div>
        //             </div>

        //         </CardHeader>
        //     </Card>
        // </div >
        <div>
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
                    border: 'solid 2px #f26522'
                }} />
                <div>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}>
                        공통 코드 관리
                    </span>
                </div>
            </div>
            <div style={{
                display: "grid",
                rowGap: "8px",
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(1, 1fr)',
                backgroundColor: '#F5F7FA',
                padding: '7px',
                borderTop: '1px solid #d3d4d6',
                borderBottom: '1px solid #d3d4d6'
            }}>
                <div style={{ display: "flex" }}>
                    <Label style={{
                        whiteSpace: 'nowrap',
                        color: '#555555',
                        fontSize: '13px',
                        marginLeft: '20px',
                        marginRight: '50px',
                    }}>
                        코드
                    </Label>
                    <Input type="email" id="email" placeholder="" autoComplete="off" style={{ backgroundColor: '#ffffff' }} />
                </div>
                <div style={{ display: "flex" }}>
                    <Label style={{
                        whiteSpace: 'nowrap',
                        color: '#555555',
                        fontSize: '13px',
                        marginLeft: '20px',
                        marginRight: '50px',
                    }}>
                        코드명
                    </Label>
                    {/* <Dropdown /> */}
                    <Input type="email" id="email" placeholder="" autoComplete="off" style={{ backgroundColor: '#ffffff' }} />
                </div>

            </div>
        </div>
    )

}
