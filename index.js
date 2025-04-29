const express = require("express");
const cors = require("cors");
const http = require("http");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");
const { WebSocketServer } = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3030;
// Передаём defaultData вторым аргументом
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { notes: [] });

async function initDb() {
  await db.read();
  // на всякий случай, если данных в файле совсем нет
  db.data ||= { notes: [] };
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Рассылка всем подключённым
function broadcastNotes() {
  const payload = JSON.stringify({ type: "notes", data: db.data.notes });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}

// Сначала инициализируем БД, потом настраиваем маршруты и WS
async function startServer() {
  await initDb();

  wss.on("connection", (ws) => {
    console.log("New WS client");
    // сразу шлём текущий список
    ws.send(JSON.stringify({ type: "notes", data: db.data.notes }));
    ws.on("close", () => console.log("WS client disconnected"));
  });

  app.get("/notes", async (req, res) => {
    await initDb();
    res.json(db.data.notes);
  });

  app.post("/notes", async (req, res) => {
    const newNote = { id: nanoid(), ...req.body };
    db.data.notes.push(newNote);
    await db.write();
    res.status(201).json(newNote);
    broadcastNotes();
  });

  app.delete("/notes/:id", async (req, res) => {
    db.data.notes = db.data.notes.filter((n) => n.id !== req.params.id);
    await db.write();
    res.status(204).send();
    broadcastNotes();
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
