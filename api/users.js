import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

let cachedClient = null;

async function getClient() {
  // If we have a cached client, verify it's still connected
  if (cachedClient) {
    try {
      await cachedClient.db().command({ ping: 1 });
      return cachedClient;
    } catch {
      // Connection is stale — close it and reconnect
      cachedClient = null;
    }
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Set it in Vercel env variables or a local .env file.");
  }

  // useUnifiedTopology and useNewUrlParser were removed in mongodb driver v4+
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
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
      const data = req.body; // expects JSON {name, email, password}
      if (!data?.name || !data?.email || !data?.password) {
        res.status(400).json({ error: "Name, email, and password are required" });
        return;
      }

      // Check if user already exists
      const existing = await collection.findOne({ email: data.email.toLowerCase() });
      if (existing) {
        res.status(409).json({ error: "Account already exists" });
        return;
      }

      // --- HASHING THE PASSWORD ---
      // '10' is the number of "salt rounds". It determines how slow/secure the hashing is.
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const result = await collection.insertOne({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword, // Store the HASH, not the plain text!
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
