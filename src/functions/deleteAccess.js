const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function deleteUserAccess(req, res) {
  await initDb();

  const { usernames } = req.body;

  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "Неверный формат данных" });
  }

  db.data.users = db.data.users.filter(
    (user) => !usernames.includes(user.username)
  );

  await db.write();

  res.json({ success: true, message: "Пользователи удалены" });
}

module.exports = deleteUserAccess;
