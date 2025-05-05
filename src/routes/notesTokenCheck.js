const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Нет токена " });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "your-secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Неверный токен" });
  }
}

function startNotesRoutes(app) {
  app.get("/user/:username/notes", authMiddleware, (req, res) => {
    if (req.params.username !== req.user.username) {
      return res.status(403).json({ error: "Доступ запрещён" });
    }
    getNotes(req, res);
  });

  app.post("/notes", authMiddleware, (req, res) => {
    req.body.username = req.user.username;
    createNote(req, res);
  });

  app.delete("/notes/:id", authMiddleware, deleteNote);
  app.put("/notes/:id", authMiddleware, updateNote);
}
