import app from '../server/index.js';
import { getDatabase } from '../server/db/database.js';

export default async function handler(req, res) {
  try {
    await getDatabase();
  } catch (err) {
    console.warn('Vercel db init note:', err.message);
  }
  return app(req, res);
}
