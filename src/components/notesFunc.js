const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const getCards = require("../functions/getCards");
const getAccessFree = require("../functions/getAcceess");

const SECRET_KEY = "your-secret-key";

const adapter = new JSONFile("db.json");
const db = new Low(adapter, { notes: [] });

async function initDb() {
  await db.read();
  db.data ||= { notes: [] };
}

async function getNotes(req, res) {
  const { userName } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Отсутствует токен авторизации" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const notes = await getCards(userName, token);
    res.json(notes);
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
}

async function createNote(req, res) {
  await initDb();
  const { userName } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Отсутствует токен авторизации" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, SECRET_KEY);
  console.log(decoded);
  const ownerId = getAccessFree(userName, decoded);
  const newNote = { id: nanoid(), ...req.body, ownerId };
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
  app.get("/user/:userName/notes", getNotes);
  app.post("/user/:userName/notes", createNote);
  app.delete("/notes/:id", deleteNote);
  app.put("/notes/:id", updateNote);
}

module.exports = { startNotesRoutes };
