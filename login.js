const bcrypt = require("bcryptjs");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your-secret-key";

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function findingUser(req, res) {
  await initDb();

  const { username, password } = req.body;

  const existingUser = db.data.users.find((user) => user.username === username);

  if (!existingUser) {
    return res.status(400).json({ error: "Неверные логин или пароль" });
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (isPasswordCorrect) {
    const token = jwt.sign({ username: existingUser.username }, SECRET_KEY, {
      expiresIn: "2h",
    });
    return res.status(200).json({ message: "Авторизация успешна", token });
  } else {
    return res.status(400).json({ error: "Неверные логин или пароль" });
  }
}

module.exports = findingUser;
