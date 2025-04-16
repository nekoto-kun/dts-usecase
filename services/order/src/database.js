'use strict';

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// Get current file path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'orders.db');
const db = new sqlite3.Database(dbPath);

export const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create orders table if it doesn't exist
      db.run(`CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                total_amount REAL NOT NULL,
                shipping_address TEXT NOT NULL,
                payment_info TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create order_items table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  order_id TEXT NOT NULL,
                  product_id INTEGER NOT NULL,
                  product_name TEXT NOT NULL,
                  quantity INTEGER NOT NULL,
                  price REAL NOT NULL,
                  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
                )`, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database initialized successfully');
            resolve();
          }
        });
      });
    });
  });
};

// Generic query function for promises
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Generic run function for INSERT, UPDATE, DELETE
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Get a single item by ID
export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Transaction support
export const beginTransaction = () => {
  return new Promise((resolve, reject) => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const commit = () => {
  return new Promise((resolve, reject) => {
    db.run('COMMIT', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const rollback = () => {
  return new Promise((resolve, reject) => {
    db.run('ROLLBACK', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export { db };
