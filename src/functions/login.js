const jwt = require("jsonwebtoken");

const SECRET_KEY = "your-secret-key";

async function findingUser(req, res) {
  const { username, password } = req.body;

  const users = [{ id: "1", username: "testuser", password: "testpassword" }];

  const existingUser = users.find((user) => user.username === username);

  if (!existingUser) {
    return res.status(400).json({ error: "Неверные логин или пароль" });
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (isPasswordCorrect) {
    const token = jwt.sign(
      { id: existingUser.id, username: existingUser.username },
      SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    return res.status(200).json({ message: "Авторизация успешна", token });
  } else {
    return res.status(400).json({ error: "Неверные логин или пароль" });
  }
}

module.exports = findingUser;
