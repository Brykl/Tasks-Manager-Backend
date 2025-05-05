const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const jwt = require("jsonwebtoken");

const adapter = new JSONFile("db.json");
const adapterUsers = new JSONFile("auth-db.json");

const SECRET_KEY = "your-secret-key";

const db = new Low(adapter, { notes: [] });
const dbUsers = new Low(adapterUsers, { users: [] });

async function initDb() {
  await db.read();
  await dbUsers.read();
  db.data ||= { notes: [] };
  dbUsers.data ||= { users: [] };
}

async function getAccess(username, decoded) {
  await initDb();
  const user = dbUsers.data.users.find((user) => user.username === username);

  if (!user) {
    throw new Error("Пользователь не найден");
  }
  console.log(decoded.id);
  if (!user.accessTo.includes(decoded.id)) {
    throw new Error("Нет Доступа");
  }
  console.log(user.id);
  return user.id;
}

async function getCards(username, token) {
  const decoded = jwt.verify(token, SECRET_KEY);
  await initDb();
  const ownerId = await getAccess(username, decoded);

  const notes = db.data.notes.filter((note) => note.ownerId === ownerId);
  if (!notes) {
    throw new Error("Не найдены заметки");
  }
  console.log(notes);
  return notes;
}

module.exports = getCards;
