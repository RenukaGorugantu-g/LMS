import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE_PATH = path.join(__dirname, 'strata_lms.db');

let dbInstance = null;
let SQL = null;

export async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    const fileBuffer = fs.readFileSync(DB_FILE_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
    saveDatabaseToDisk(dbInstance);
  }

  // Enable foreign keys
  dbInstance.run("PRAGMA foreign_keys = ON;");

  return dbInstance;
}

export function saveDatabaseToDisk(db = dbInstance) {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE_PATH, buffer);
}

/**
 * Execute a query that returns multiple rows as an array of objects
 */
export async function query(sql, params = []) {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  const safeParams = params.map(p => (p === undefined ? null : p));
  stmt.bind(safeParams);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute a query that returns a single row as an object
 */
export async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement and save changes
 */
export async function run(sql, params = []) {
  const db = await getDatabase();
  const safeParams = params.map(p => (p === undefined ? null : p));
  db.run(sql, safeParams);
  saveDatabaseToDisk(db);
  const info = db.exec("SELECT changes() AS changes, last_insert_rowid() AS lastId;");
  let changes = 0;
  let lastId = 0;
  if (info.length > 0 && info[0].values.length > 0) {
    changes = info[0].values[0][0];
    lastId = info[0].values[0][1];
  }
  return { changes, lastInsertRowid: lastId };
}

/**
 * Execute multiple raw SQL statements without parameters
 */
export async function exec(sql) {
  const db = await getDatabase();
  db.exec(sql);
  saveDatabaseToDisk(db);
}
