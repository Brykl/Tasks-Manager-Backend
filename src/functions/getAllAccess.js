const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function getAllAccess(req, res) {
  await initDb();

  const userData = req.user;

  const allUsers = db.data.users;
  const currentUser = allUsers.find(
    (user) => user.username === userData.username
  );

  if (!currentUser) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  const result = allUsers.reduce(
    (acc, user) => {
      if (user.username === currentUser.username) return acc;

      if (currentUser.accessTo.includes(user.id)) {
        acc.accessGranted.push(user.username);
      } else {
        acc.accessDenied.push(user.username);
      }
      return acc;
    },
    { accessGranted: [], accessDenied: [] }
  );

  res.json(result);
}

module.exports = getAllAccess;
