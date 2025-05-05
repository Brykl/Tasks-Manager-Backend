const express = require("express");
const jwt = require("jsonwebtoken");
const findingUsername = require("../functions/findAccessTo");
const routerProfile = express.Router();
const SECRET_KEY = "your-secret-key";

routerProfile.get("/:userName", async (req, res) => {
  const { userName } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ error: "Токен не найден" });
  }

  try {
    const decoded = await jwt.verify(token, SECRET_KEY);

    if (decoded.username === userName) {
      const accessTo = await findingUsername(userName);
      return res.status(200).json({
        message: "Профиль найден",
        username: decoded.username,
        userId: decoded.userId,
        accessTo: accessTo,
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

module.exports = routerProfile;
