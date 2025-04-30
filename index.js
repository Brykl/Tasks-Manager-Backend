const express = require("express");
const cors = require("cors");
const http = require("http");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3030;
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { notes: [] });

async function initDb() {
  await db.read();
  db.data ||= { notes: [] };
}

const server = http.createServer(app);

async function startServer() {
  await initDb();

  app.get("/notes", async (req, res) => {
    await initDb();
    res.json(db.data.notes);
  });

  app.post("/notes", async (req, res) => {
    const newNote = { id: nanoid(), ...req.body };
    db.data.notes.unshift(newNote);
    await db.write();
    res.status(201).json(newNote);
  });

  app.delete("/notes/:id", async (req, res) => {
    db.data.notes = db.data.notes.filter((n) => n.id !== req.params.id);
    await db.write();
    res.status(204).send();
  });

  app.put("/notes/:id", async (req, res) => {
    const noteIndex = db.data.notes.findIndex((n) => n.id === req.params.id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: "Заметка не найдена" });
    }

    db.data.notes[noteIndex] = { ...db.data.notes[noteIndex], ...req.body };
    await db.write();
    res.json(db.data.notes[noteIndex]);
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
