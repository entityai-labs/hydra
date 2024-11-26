const initSqlJs = require("sql.js");

const fs = require("node:fs");
const dbFile = "db.sqlite";

const loadDatabase = async () => {
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(dbFile)) {
    const fileBuffer = fs.readFileSync(dbFile);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    db.run(
      `
      CREATE TABLE IF NOT EXISTS autorole (guild_id TEXT PRIMARY KEY, role_id TEXT NOT NULL, role TEXT UNIQUE);
      CREATE TABLE IF NOT EXISTS welcome (guild_id TEXT PRIMARY KEY, channel_id TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS word_filter (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT UNIQUE);
      `
    );
  }

  return db;
};

const saveDatabase = (db) => {
  const data = db.export();
  fs.writeFileSync(dbFile, Buffer.from(data));
};

module.exports = { saveDatabase, loadDatabase };
