import clientPromise from "./mongodb";

export default async function findAll() {
    try {
        const client = await clientPromise
        const db = client.db("sample_mflix")
        console.log("DB 연결 성공...")

        const comments = await db.collection("comments").find({}).toArray()

        return Response.json({ success: true, data: comments })
    } catch (error) {
        console.error('Database error:', error)
        return Response.json({ success: false, error: error.message }, { status: 500 })
    }
}