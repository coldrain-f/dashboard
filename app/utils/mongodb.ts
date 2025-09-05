// app/utils/database.ts

import { MongoClient } from 'mongodb'

const url =
    "mongodb+srv://sangwoonin:qhanftja1!@cluster0.chut07m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const options: any = { useNewUrlParser: true }
let connectDB: Promise<MongoClient>

const env = "development"

if (env === 'development') {
    // 개발 중 재실행을 막음
    if (!global._mongo) {
        global._mongo = new MongoClient(url, options).connect()
    }
    connectDB = global._mongo
} else {
    connectDB = new MongoClient(url, options).connect()
}

export { connectDB }