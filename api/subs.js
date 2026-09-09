import { MongoClient } from "mongodb";

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
  if (!uri) throw new Error("MONGODB_URI missing");

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
    const collection = client.db().collection("users");

    if (req.method === "GET") {
      const email = req.query.email;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const user = await collection.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.status(200).json(user.subs || []);
    }

    if (req.method === "POST") {
      const { email, subs } = req.body;
      if (!email || subs === undefined || subs === null) return res.status(400).json({ error: "Email and subs required" });

      await collection.updateOne(
        { email: email.toLowerCase() },
        { $set: { subs: subs } }
      );

      return res.status(200).json({ success: true });
    }

    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Subs API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
