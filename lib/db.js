const { Pool } = require("pg");
let pool;
function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }, max: 5 });
  return pool;
}
module.exports = { getPool };