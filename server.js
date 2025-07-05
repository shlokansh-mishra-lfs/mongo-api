import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "mydb";

app.get("/users", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  } finally {
    await client.close();
  }
});

app.post("/users", async (req, res) => {
  const newUser = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection("users").insertOne(newUser);
    res.status(201).json({ message: "User added", userId: result.insertedId });
  } catch (err) {
    res.status(500).send("Error saving user");
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
