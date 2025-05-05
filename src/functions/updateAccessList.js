const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const adapter = new JSONFile("auth-db.json");
const db = new Low(adapter, { users: [] });

async function initDb() {
  await db.read();
  db.data ||= { users: [] };
}

async function updateUserAccess(req, res) {
  await initDb();

  const { username } = req.user; 
  const { accessTo } = req.body; 
  console.log(accessTo);

  const user = db.data.users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }




    user.accessTo = []



    console.log(accessTo)

    if (accessTo) {
      const newAccessIds = accessTo
    .map((targetUsername) => {
      const targetUser = db.data.users.find((u) => u.username === targetUsername);
      return targetUser?.id;
    })
    .filter(Boolean);
    user.accessTo = [user.id, ...newAccessIds];
    } 
    if(!accessTo) {
      user.accessTo = []
      user.accessTo.push(user.id);
    }

    console.log("user.accessTo: " + user.accessTo)
 


  await db.write();

  res.json({ success: true, user });
}

module.exports = updateUserAccess;
