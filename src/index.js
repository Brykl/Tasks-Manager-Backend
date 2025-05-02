const express = require("express");
const cors = require("cors");
const http = require("http");
const { startNotesRoutes } = require("./components/notesFunc");
const registerUser = require("./functions/registration");
const findingUser = require("./functions/login");
const routerProfile = require("./routes/profile");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3030;
const server = http.createServer(app);

startNotesRoutes(app);

app.post("/register", registerUser);
app.post("/login", findingUser);

app.use("/user", routerProfile);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
