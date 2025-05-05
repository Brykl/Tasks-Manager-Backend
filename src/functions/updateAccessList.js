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

  const { username } = req.user; // Текущий пользователь
  const { accessTo } = req.body; // Новый список пользователей для доступа

  const user = db.data.users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  // Если нет accessTo, создаем его как пустой массив
  if (!user.accessTo) {
    user.accessTo = [];
  }

  // Пушим id текущего пользователя в accessTo, если его еще нет
  if (!user.accessTo.includes(user.id)) {
    user.accessTo.push(user.id);
  }

  // Преобразуем имена пользователей из списка accessTo в их ID
  if (accessTo && Array.isArray(accessTo)) {
    accessTo.forEach((username) => {
      const targetUser = db.data.users.find(
        (user) => user.username === username
      );
      if (targetUser && !user.accessTo.includes(targetUser.id)) {
        user.accessTo.push(targetUser.id);
      }
    });
  }

  await db.write();

  res.json({ success: true, user });
}

module.exports = updateUserAccess;
