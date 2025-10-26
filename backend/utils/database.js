const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '..', 'data', 'users.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('Users table created/verified');
          resolve();
        }
      });
    });
  }

  async createUser(name, email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if user already exists
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
          return resolve({ success: false, error: 'User with this email already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const insertUser = `
          INSERT INTO users (name, email, password_hash)
          VALUES (?, ?, ?)
        `;

        this.db.run(insertUser, [name, email, passwordHash], function(err) {
          if (err) {
            console.error('Error creating user:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              user: {
                id: this.lastID,
                name,
                email,
                created_at: new Date().toISOString()
              }
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const selectUser = `SELECT * FROM users WHERE email = ?`;
      
      this.db.get(selectUser, [email], (err, row) => {
        if (err) {
          console.error('Error getting user by email:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const selectUser = `SELECT id, name, email, created_at FROM users WHERE id = ?`;
      
      this.db.get(selectUser, [id], (err, row) => {
        if (err) {
          console.error('Error getting user by id:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async authenticateUser(email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.getUserByEmail(email);
        
        if (!user) {
          return resolve({ success: false, error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
          return resolve({ success: false, error: 'Invalid email or password' });
        }

        // Return user without password hash
        const { password_hash, ...userWithoutPassword } = user;
        resolve({
          success: true,
          user: userWithoutPassword
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateUser(id, updates) {
    return new Promise(async (resolve, reject) => {
      try {
        const allowedFields = ['name', 'email'];
        const updateFields = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
          if (allowedFields.includes(key) && value !== undefined) {
            updateFields.push(`${key} = ?`);
            values.push(value);
          }
        }

        if (updateFields.length === 0) {
          return resolve({ success: false, error: 'No valid fields to update' });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const updateUser = `
          UPDATE users 
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;

        this.db.run(updateUser, values, function(err) {
          if (err) {
            console.error('Error updating user:', err);
            reject(err);
          } else {
            resolve({
              success: true,
              changes: this.changes
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteUser(id) {
    return new Promise((resolve, reject) => {
      const deleteUser = `DELETE FROM users WHERE id = ?`;
      
      this.db.run(deleteUser, [id], function(err) {
        if (err) {
          console.error('Error deleting user:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            changes: this.changes
          });
        }
      });
    });
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const selectUsers = `SELECT id, name, email, created_at FROM users ORDER BY created_at DESC`;
      
      this.db.all(selectUsers, [], (err, rows) => {
        if (err) {
          console.error('Error getting all users:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

// Create a singleton instance
const database = new Database();

module.exports = database;
