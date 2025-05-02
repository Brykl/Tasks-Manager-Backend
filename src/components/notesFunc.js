const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");

const adapter = new JSONFile("db.json");
const db = new Low(adapter, { notes: [] });

async function initDb() {
  await db.read();
  db.data ||= { notes: [] };
}

async function getNotes(req, res) {
  await initDb();
  res.json(db.data.notes);
}

async function createNote(req, res) {
  await initDb();
  const newNote = { id: nanoid(), ...req.body };
  db.data.notes.unshift(newNote);
  await db.write();
  res.status(201).json(newNote);
}

async function deleteNote(req, res) {
  await initDb();
  db.data.notes = db.data.notes.filter((n) => n.id !== req.params.id);
  await db.write();
  res.status(204).send();
}

async function updateNote(req, res) {
  await initDb();
  const noteIndex = db.data.notes.findIndex((n) => n.id === req.params.id);
  if (noteIndex === -1) {
    return res.status(404).json({ error: "Заметка не найдена" });
  }

  db.data.notes[noteIndex] = { ...db.data.notes[noteIndex], ...req.body };
  await db.write();
  res.json(db.data.notes[noteIndex]);
}

function startNotesRoutes(app) {
  app.get("/notes", getNotes);
  app.post("/notes", createNote);
  app.delete("/notes/:id", deleteNote);
  app.put("/notes/:id", updateNote);
}

module.exports = { startNotesRoutes };
