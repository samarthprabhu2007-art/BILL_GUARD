import { MongoClient } from "mongodb";

let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
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
      if (!email || !subs) return res.status(400).json({ error: "Email and subs required" });

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
