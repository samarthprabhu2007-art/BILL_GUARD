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
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const client = await getClient();
    const collection = client.db().collection("users");

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await collection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "No account found with this email. Please sign up." });
    }

    // --- COMPARING THE PASSWORD ---
    // We use bcrypt.compare to securely check if the text matches the hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Wrong password. Please try again." });
    }

    res.status(200).json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("Login API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
