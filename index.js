const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const url = "mongodb://127.0.0.1:27017"; // Replace with your MongoDB Atlas URL if needed
const dbName = "myDatabase";
let db;

MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB!");
    db = client.db(dbName);
  })
  .catch((err) => console.error("MongoDB connection failed:", err));

// Routes

// CREATE
app.post("/items", async (req, res) => {
  const newItem = req.body;
  try {
    const result = await db.collection("items").insertOne(newItem);
    res.status(201).send({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// READ (All Items)
app.get("/items", async (req, res) => {
  try {
    const items = await db.collection("items").find().toArray();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// READ (Single Item by ID)
app.get("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await db.collection("items").findOne({ _id: new ObjectId(id) });
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).send({ error: "Item not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// UPDATE
app.put("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const result = await db
      .collection("items")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).send({ success: true });
    } else {
      res.status(404).send({ error: "Item not found or not updated" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// DELETE
app.delete("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db
      .collection("items")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      res.status(200).send({ success: true });
    } else {
      res.status(404).send({ error: "Item not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
