const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

async function main() {
  const file = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(file, "utf8"));

  const admin = users.find((u) => u.username === "admin");

  admin.passwordHash = await bcrypt.hash("AdminDemo123!", 12);

  fs.writeFileSync(file, JSON.stringify(users, null, 2));

  console.log("Demo admin account created.");
  console.log("Username: admin");
  console.log("Password: AdminDemo123!");
  console.log("Change this demo password before any deployment.");
}

main().catch(console.error);