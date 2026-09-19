const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const dbPath = path.join(process.cwd(), "db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (req.method === "GET" && req.url === "/menu") {
    return res.status(200).json(db.menu);
  }

  return res.status(404).json({
    error: "Route not found",
  });
};
