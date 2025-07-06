import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Lightweight ping route (no DB)
app.get("/ping", (req, res) => res.send("pong"));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "mydb";

// READ all users
app.get("/users", async (req, res) => {
  try {
    await client.connect();
    const users = await client.db(dbName).collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  } finally {
    await client.close();
  }
});

// CREATE a user
app.post("/users", async (req, res) => {
  try {
    await client.connect();
    const result = await client.db(dbName).collection("users").insertOne(req.body);
    res.status(201).json({ message: "User added", userId: result.insertedId });
  } catch (err) {
    res.status(500).send("Error saving user");
  } finally {
    await client.close();
  }
});

// UPDATE a user
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await client.connect();
    const result = await client.db(dbName).collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    if (!result.matchedCount) return res.status(404).send("User not found");
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).send("Error updating user");
  } finally {
    await client.close();
  }
});

// DELETE a user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await client.connect();
    const result = await client.db(dbName).collection("users").deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return res.status(404).send("User not found");
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).send("Error deleting user");
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
