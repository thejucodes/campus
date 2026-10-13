import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../campuspulse.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

export const db = new Database(dbPath);

// Enable WAL mode for concurrent performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema if not exists
export function initDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('[DB] SQLite database initialized at:', dbPath);
}
