const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET_KEY = "your-secret-key";

router.get("/:userName", (req, res) => {
  const { userName } = req.params;
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: "Токен не найден" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.username === userName) {
      return res.status(200).json({
        message: "Профиль найден",
        username: decoded.username,
        userId: decoded.userId,
      });
    } else {
      return res
        .status(403)
        .json({ error: "Неверное имя пользователя в токене" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Неверный или истекший токен" });
  }
});

module.exports = router;
