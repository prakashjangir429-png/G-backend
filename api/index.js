import "dotenv/config";
import app from "../src/server.js";
import connectDB from "../src/config/database.js";

let dbPromise;

export default async function handler(req, res) {
  if (!dbPromise) dbPromise = connectDB();
  await dbPromise;
  return app(req, res);
}
