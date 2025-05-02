const bcrypt = require("bcryptjs");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function registerUser(req, res) {
  await initDb();

  const { username, password } = req.body;

  const existingUser = db.data.users.find((user) => user.username === username);
  if (existingUser) {
    return res
      .status(400)
      .json({ error: "Пользователь с таким именем уже существует" });
  }

  if (password.length < 4) {
    return res
      .status(400)
      .json({ error: "Длинна пароля должна быть больше 4" });
  }

  if (username.length < 4) {
    return res
      .status(400)
      .json({ error: "Длинна имени пользователя должна быть больше 4" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = Date.now().toString();
  const newUser = {
    id,
    username,
    password: hashedPassword,
    accessTo: [id],
  };
  db.data.users.push(newUser);
  db.write();
  res.status(200).json({ message: "Пользователь успешно создан" });
}

module.exports = registerUser;
