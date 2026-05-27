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

    if (user.password !== password) {
      return res.status(401).json({ error: "Wrong password. Please try again." });
    }

    res.status(200).json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("Login API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
