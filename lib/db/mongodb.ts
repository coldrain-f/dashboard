import { MongoClient } from 'mongodb'

const uri = "mongodb+srv://sangwoonin:qhanftja1!@cluster0.chut07m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
  // 개발 중 재실행을 막음
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
