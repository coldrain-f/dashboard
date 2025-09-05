// app/api/comments/route.ts
import { connectDB } from "@/app/utils/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const client = await connectDB;
        const db = client.db("shadcn");

        const rows = await db.collection("household").find({}).sort({ 'col1': -1, 'col2': -1, 'col3': 1, 'col4': 1 }).toArray();

        const serializedComments = rows.map(row => ({
            ...row,
            _id: row._id.toString()
        }))

        return NextResponse.json({ success: true, data: serializedComments });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "DB 조회에 실패했습니다..." },
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
            db.collection("household")
                .deleteOne({
                    _id: ObjectId.createFromHexString(rows[i]._id)
                });
        }

        return NextResponse.json({ success: true, data: null })
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "DB 조회에 실패했습니다..." },
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
                await db.collection("household").insertOne(rows[i]);
            } else {
                const { _id, ...updateData } = rows[i];  // _id 제거
                await db.collection("household").replaceOne({
                    _id: ObjectId.createFromHexString(rows[i]._id)
                },
                    updateData // 이걸로 교체
                )
            }
        }

        // await db.collection("common-code-group").insertMany(commonCodeGroup);

        return NextResponse.json({ success: true, data: null })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json(
            { success: false, error: "DB 조회에 실패했습니다..." },
            { status: 500 }
        )
    }
}