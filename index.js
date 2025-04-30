const express = require("express");
const cors = require("cors");
const http = require("http");
const { startNotesRoutes } = require("./notesFunc");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3030;
const server = http.createServer(app);

startNotesRoutes(app);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
