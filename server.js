import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri);
let db;

// 🔁 Connect once at startup
client.connect()
  .then(() => {
    db = client.db("mydb");
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ✅ Ping route (for uptime bots)
app.get("/ping", (req, res) => {
  res.send("pong");
});

// ✅ GET all users
app.get("/users", async (req, res) => {
  try {
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    console.error("❌ GET /users error:", err);
    res.status(500).send("Error fetching users");
  }
});

// ✅ POST new user
app.post("/users", async (req, res) => {
  const newUser = req.body;

  try {
    const result = await db.collection("users").insertOne(newUser);
    res.status(201).json({ message: "User added", userId: result.insertedId });
  } catch (err) {
    console.error("❌ POST /users error:", err);
    res.status(500).send("Error saving user");
  }
});

// ✅ PUT (update) user
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, email } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send("User not found or unchanged");
    }

    res.json({ message: "User updated" });
  } catch (err) {
    console.error("❌ PUT /users/:id error:", err);
    res.status(500).send("Update failed");
  }
});

// ✅ DELETE user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send("User not found");
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ DELETE /users/:id error:", err);
    res.status(500).send("Delete failed");
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
