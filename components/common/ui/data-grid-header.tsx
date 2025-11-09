'use client';

import { Button } from "@/components/ui/button";
import { IconDeviceFloppy, IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";

interface DataGridHeaderProps {
    title: string;
    onReset?: () => void;
    onAdd?: () => void;
    onDelete?: () => void;
    onSave?: () => void;
    showReset?: boolean;
    showAdd?: boolean;
    showDelete?: boolean;
    showSave?: boolean;
}

export default function DataGridHeader({
    title,
    onReset,
    onAdd,
    onDelete,
    onSave,
    showReset = true,
    showAdd = true,
    showDelete = true,
    showSave = true
}: DataGridHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <div className="flex mb-2.5">

                    <div className="inline-block align-top mt-[9px] mr-[7px] mb-2 h-[7px] w-[7px] border-2 border-[#999999]" />
                    <div>
                        <span className="text-lg font-bold">
                            {title}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end mb-2">
                {showReset &&
                    <Button
                        size="sm"
                        className="cursor-pointer gap-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 rounded-lg"
                        onClick={onReset}
                    >
                        <IconRefresh />
                        초기화
                    </Button>
                }
                {showAdd &&
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        className="cursor-pointer"
                        onClick={onAdd}
                    >
                        <IconPlus />
                        행 추가
                    </Button>
                }
                {showDelete &&
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        className="cursor-pointer"
                        onClick={onDelete}
                    >
                        <IconMinus />
                        행 삭제
                    </Button>
                }
                {showSave &&
                    <Button
                        variant={"default"}
                        size={"sm"}
                        className="cursor-pointer"
                        onClick={onSave}
                    >
                        <IconDeviceFloppy />
                        저장
                    </Button>
                }
            </div>
        </div>
    );
}