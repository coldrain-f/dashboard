'use client';

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { invoke } from "@/app/dashboard/anki/api"
import { useState } from "react";
import { Dropdown } from "./dropdown";

const frameworks = [
    {
        value: "next.js",
        label: "이동",
    },
    {
        value: "sveltekit",
        label: "수입",
    },
    {
        value: "nuxt.js",
        label: "지출",
    }
]

export function SearchForm() {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    return (
        // *:data-[slot=card]:from-primary/5
        <div>
            <Card className="@container/card">
                <CardHeader>
                    <CardAction>
                        <div className="flex gap-2">
                            <Button>조회</Button>
                            <Button variant="outline">초기화</Button>
                        </div>
                    </CardAction>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="flex max-w-xs items-center gap-5">
                            <Label htmlFor="email" className="min-w-16 whitespace-nowrap">날짜</Label>
                            <Dropdown />
                        </div>
                        <div className="flex max-w-xs items-center gap-5">
                            <Label htmlFor="email" className="min-w-16 whitespace-nowrap">구분</Label>
                            <Dropdown />
                        </div>

                        <div className="flex w-[400px] max-w-xs items-center gap-5">
                            <Label htmlFor="email" className="min-w-16 whitespace-nowrap">대분류</Label>
                            <Dropdown />
                            {/* <Input type="email" id="email" placeholder="" /> */}
                        </div>
                        <div className="flex w-[400px] max-w-xs items-center gap-5">
                            <Label htmlFor="email" className="min-w-16 whitespace-nowrap">소분류</Label>
                            <Dropdown />
                        </div>
                        <div className="flex w-[400px] max-w-xs items-center gap-5">
                            <Label htmlFor="email" className="min-w-16 whitespace-nowrap">입금계좌</Label>
                            <Dropdown />
                        </div>
                        <div className="flex w-[400px] max-w-xs items-center gap-5">
                            <Label htmlFor="email" className="min-w-16 !w-16 whitespace-nowrap">출금계좌</Label>
                            <Dropdown />
                        </div>
                    </div>

                </CardHeader>
            </Card>
        </div>
    )

}
