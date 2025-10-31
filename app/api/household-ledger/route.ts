// app/api/household-ledger/route.ts
import { connectDB } from "@/app/utils/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const client = await connectDB;
        const db = client.db("shadcn");

        const rows = await db.collection("household-ledger").find({}).sort({ 'date': -1 }).toArray();

        const serializedData = rows.map(row => ({
            ...row,
            _id: row._id.toString()
        }))

        return NextResponse.json({ success: true, data: serializedData });
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json(
            { success: false, error: "데이터 조회에 실패했습니다." },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const client = await connectDB;
        const db = client.db("shadcn");

        const rows = await request.json();

        for (let i = 0; i < rows.length; i++) {
            await db.collection("household-ledger").deleteOne({
                _id: ObjectId.createFromHexString(rows[i]._id)
            });
        }

        return NextResponse.json({ success: true, data: null })
    } catch (error) {
        console.error('DELETE Error:', error);
        return NextResponse.json(
            { success: false, error: "삭제에 실패했습니다." },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const client = await connectDB;
        const db = client.db("shadcn");

        const rows = await request.json();

        for (let i = 0; i < rows.length; i++) {
            const _id = rows[i]._id;
            if (!_id) {
                // 신규 삽입
                await db.collection("household-ledger").insertOne(rows[i]);
            } else {
                // 기존 데이터 업데이트
                const { _id, ...updateData } = rows[i];
                await db.collection("household-ledger").replaceOne(
                    { _id: ObjectId.createFromHexString(rows[i]._id) },
                    updateData
                )
            }
        }

        return NextResponse.json({ success: true, data: null })
    } catch (error) {
        console.error('POST Error:', error)
        return NextResponse.json(
            { success: false, error: "저장에 실패했습니다." },
            { status: 500 }
        )
    }
}