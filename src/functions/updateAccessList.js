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

  user.accessTo = accessTo;

  await db.write();

  res.json({ success: true, user });
}

module.exports = updateUserAccess;
