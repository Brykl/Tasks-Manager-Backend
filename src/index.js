const express = require("express");
const cors = require("cors");
const http = require("http");
const { startNotesRoutes } = require("./components/notesFunc");
const registerUser = require("./functions/registration");
const findingUser = require("./functions/login");
const routerProfile = require("./routes/profile");
const authMiddleware = require("./functions/checkingToken");
const getAllAccess = require("./functions/getAllAccess");
const updateUserAccess = require("./functions/updateAccessList");
const deleteUserAccess = require("./functions/deleteAccess");
const router = express.Router();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3030;
const server = http.createServer(app);

startNotesRoutes(app);

app.post("/register", registerUser);
app.post("/login", findingUser);
app.get("/checkToken", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});
app.get("/access-list", authMiddleware, getAllAccess);
app.put("/delete-access", deleteUserAccess);

app.put("/user/update-access/:userId", authMiddleware, updateUserAccess);

app.use("/user", routerProfile);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
