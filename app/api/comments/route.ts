// app/api/comments/route.ts
import { connectDB } from "@/app/utils/mongodb";
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const client = await connectDB
        const db = client.db("sample_mflix")

        const comments = await db.collection("comments").find({}).toArray()

        // ObjectId를 문자열로 변환
        const serializedComments = comments.map(comment => ({
            ...comment,
            _id: comment._id.toString()
        }))

        return NextResponse.json({ success: true, data: serializedComments })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json(
            { success: false, error: "DB 조회에 실패했습니다..." },
            { status: 500 }
        )
    }
}