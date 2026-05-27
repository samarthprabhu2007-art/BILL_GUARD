// api/users.js
import { MongoClient } from "mongodb";

let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Set it in Vercel env variables or a local .env file.");
  }
  const client = new MongoClient(uri, {
    // The driver options recommended for serverless environments
    // See https://www.mongodb.com/docs/drivers/node/current/usage-examples/connection-pool/
    maxPoolSize: 10,
    minPoolSize: 0,
    // Serverless-friendly settings
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  try {
    const client = await getClient();
    const db = client.db(); // db name comes from connection string
    const collection = db.collection("users");

    if (req.method === "GET") {
      const users = await collection.find({}).toArray();
      res.status(200).json(users);
      return;
    }

    if (req.method === "POST") {
      const data = req.body; // expects JSON {name, email}
      if (!data?.name || !data?.email) {
        res.status(400).json({ error: "Name and email are required" });
        return;
      }
      const result = await collection.insertOne({
        name: data.name,
        email: data.email,
        createdAt: new Date(),
      });
      res.status(201).json({ insertedId: result.insertedId });
      return;
    }

    // If we reach here, method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
