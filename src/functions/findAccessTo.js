const bcrypt = require("bcryptjs");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const jwt = require("jsonwebtoken");

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function findingUsername(userName) {
  await initDb();

  const existingUser = db.data.users.find((user) => user.username === userName);

  if (!existingUser) {
    return res.status(400).json({ error: "Пользователь не найден" });
  }

  if (existingUser) {
    const resultAccessTo = db.data.users
      .filter((user) => user.accessTo.includes(existingUser.id))
      .map((user) => user.username);
    return resultAccessTo;
  } else {
    return "Error при получении доступа к базе данных";
  }
}

module.exports = findingUsername;
