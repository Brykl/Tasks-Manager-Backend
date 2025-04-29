const express = require("express");
const cors = require("cors");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");

const app = express();
const PORT = 3030;

app.use(cors());
app.use(express.json());

const adapter = new JSONFile("db.json", { notes: [] });
const db = new Low(adapter, { notes: [] });

async function startServer() {
  await db.read();
  db.data ||= { notes: [] };

  app.get("/notes", async (req, res) => {
    await db.read();
    res.json(db.data.notes);
  });

  app.post("/notes", async (req, res) => {
    const newNote = { ...req.body };
    db.data.notes.push(newNote);
    await db.write();
    res.status(201).json(newNote);
  });

  app.delete("/notes/:id", async (req, res) => {
    db.data.notes = db.data.notes.filter((note) => note.id !== req.params.id);
    await db.write();
    res.status(204).send();
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
