// app/api/common-code-groups/route.ts
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from 'next/server'
import { success } from "zod";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("shadcn");

        const commonCodeGroups = await db.collection("common-code-group").find({}).sort({ 'code': 1 }).toArray();

        const serializedComments = commonCodeGroups.map(codeGroup => ({
            ...codeGroup,
            _id: codeGroup._id.toString()
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
        const client = await clientPromise;
        const db = client.db("shadcn");

        const commonCodeGroups = await request.json();
        for (let i = 0; i < commonCodeGroups.length; i++) {
            db.collection("common-code-group").deleteOne({ code: commonCodeGroups[i].code });
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
        const client = await clientPromise;
        const db = client.db("shadcn");

        const commonCodeGroup = await request.json();

        for (let i = 0; i < commonCodeGroup.length; i++) {
            const columnStatus = commonCodeGroup[i].status;
            commonCodeGroup[i].status = '';
            if (columnStatus === '신규') {
                await db.collection("common-code-group").insertOne(commonCodeGroup[i]);
            } else if (columnStatus === '수정') {
                await db.collection("common-code-group").updateOne({ code: commonCodeGroup[i].code },
                    { $set: { code: "ADDDDD1" } }
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