const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function updateUserAccess(req, res) {
  await initDb();

  const { username } = req.user;
  const { accessTo } = req.body;

  const user = db.data.users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  // Если нет accessTo, создаем его как пустой массив
  if (!user.accessTo) {
    user.accessTo = [];
  }

  // Пушим id пользователя в accessTo, если его еще нет
  if (!user.accessTo.includes(user.id)) {
    user.accessTo.push(user.id);
  }

  // Пушим новый ID в список accessTo, если его еще нет
  if (accessTo && !user.accessTo.includes(accessTo)) {
    user.accessTo.push(accessTo);
  }

  await db.write();

  res.json({ success: true, user });
}

module.exports = updateUserAccess;
