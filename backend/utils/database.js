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

      const createPlantsTable = `
        CREATE TABLE IF NOT EXISTS plants (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          species TEXT,
          image TEXT,
          last_watered DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `;

      const createLogsTable = `
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          plant_id TEXT NOT NULL,
          note TEXT NOT NULL,
          type TEXT DEFAULT 'general',
          mood TEXT DEFAULT 'neutral',
          photos TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE
        )
      `;

      // Create tables sequentially
      this.db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('Users table created/verified');
          
          this.db.run(createPlantsTable, (err) => {
            if (err) {
              console.error('Error creating plants table:', err);
              reject(err);
            } else {
              console.log('Plants table created/verified');
              
              this.db.run(createLogsTable, (err) => {
                if (err) {
                  console.error('Error creating logs table:', err);
                  reject(err);
                } else {
                  console.log('Logs table created/verified');
                  resolve();
                }
              });
            }
          });
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

  // Plant methods
  async createPlant(userId, plantData) {
    return new Promise((resolve, reject) => {
      const { id, name, species, image, lastWatered } = plantData;
      const insertPlant = `
        INSERT INTO plants (id, user_id, name, species, image, last_watered)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(insertPlant, [id, userId, name, species, image, lastWatered], function(err) {
        if (err) {
          console.error('Error creating plant:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            plant: {
              id,
              userId,
              name,
              species,
              image,
              lastWatered,
              createdAt: new Date().toISOString()
            }
          });
        }
      });
    });
  }

  async getUserPlants(userId) {
    return new Promise((resolve, reject) => {
      const selectPlants = `SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC`;
      
      this.db.all(selectPlants, [userId], (err, rows) => {
        if (err) {
          console.error('Error getting user plants:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getPlantById(plantId, userId) {
    return new Promise((resolve, reject) => {
      const selectPlant = `SELECT * FROM plants WHERE id = ? AND user_id = ?`;
      
      this.db.get(selectPlant, [plantId, userId], (err, row) => {
        if (err) {
          console.error('Error getting plant by id:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async updatePlant(plantId, userId, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['name', 'species', 'image', 'last_watered'];
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
      values.push(plantId, userId);

      const updatePlant = `
        UPDATE plants 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `;

      this.db.run(updatePlant, values, function(err) {
        if (err) {
          console.error('Error updating plant:', err);
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

  async deletePlant(plantId, userId) {
    return new Promise((resolve, reject) => {
      const deletePlant = `DELETE FROM plants WHERE id = ? AND user_id = ?`;
      
      this.db.run(deletePlant, [plantId, userId], function(err) {
        if (err) {
          console.error('Error deleting plant:', err);
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

  // Log methods
  async createLog(userId, logData) {
    return new Promise((resolve, reject) => {
      const { id, plantId, note, type, mood, photos } = logData;
      const photosJson = photos ? JSON.stringify(photos) : null;
      
      const insertLog = `
        INSERT INTO logs (id, user_id, plant_id, note, type, mood, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(insertLog, [id, userId, plantId, note, type, mood, photosJson], function(err) {
        if (err) {
          console.error('Error creating log:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            log: {
              id,
              userId,
              plantId,
              note,
              type,
              mood,
              photos,
              timestamp: new Date().toISOString()
            }
          });
        }
      });
    });
  }

  async getUserLogs(userId, plantId = null, limit = 10, type = null) {
    return new Promise((resolve, reject) => {
      let selectLogs = `SELECT * FROM logs WHERE user_id = ?`;
      const params = [userId];

      if (plantId) {
        selectLogs += ` AND plant_id = ?`;
        params.push(plantId);
      }

      if (type) {
        selectLogs += ` AND type = ?`;
        params.push(type);
      }

      selectLogs += ` ORDER BY timestamp DESC LIMIT ?`;
      params.push(limit);

      this.db.all(selectLogs, params, (err, rows) => {
        if (err) {
          console.error('Error getting user logs:', err);
          reject(err);
        } else {
          // Parse photos JSON for each log
          const logs = rows.map(row => ({
            ...row,
            photos: row.photos ? JSON.parse(row.photos) : []
          }));
          resolve(logs);
        }
      });
    });
  }

  async getLogById(logId, userId) {
    return new Promise((resolve, reject) => {
      const selectLog = `SELECT * FROM logs WHERE id = ? AND user_id = ?`;
      
      this.db.get(selectLog, [logId, userId], (err, row) => {
        if (err) {
          console.error('Error getting log by id:', err);
          reject(err);
        } else {
          if (row) {
            row.photos = row.photos ? JSON.parse(row.photos) : [];
          }
          resolve(row);
        }
      });
    });
  }

  async updateLog(logId, userId, updates) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['note', 'type', 'mood', 'photos'];
      const updateFields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'photos') {
            updateFields.push(`${key} = ?`);
            values.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            values.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        return resolve({ success: false, error: 'No valid fields to update' });
      }

      values.push(logId, userId);

      const updateLog = `
        UPDATE logs 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `;

      this.db.run(updateLog, values, function(err) {
        if (err) {
          console.error('Error updating log:', err);
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

  async deleteLog(logId, userId) {
    return new Promise((resolve, reject) => {
      const deleteLog = `DELETE FROM logs WHERE id = ? AND user_id = ?`;
      
      this.db.run(deleteLog, [logId, userId], function(err) {
        if (err) {
          console.error('Error deleting log:', err);
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

  async getLogStats(userId, plantId = null) {
    return new Promise((resolve, reject) => {
      let selectLogs = `SELECT * FROM logs WHERE user_id = ?`;
      const params = [userId];

      if (plantId) {
        selectLogs += ` AND plant_id = ?`;
        params.push(plantId);
      }

      this.db.all(selectLogs, params, (err, rows) => {
        if (err) {
          console.error('Error getting log stats:', err);
          reject(err);
        } else {
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          const stats = {
            totalLogs: rows.length,
            logsThisWeek: rows.filter(log => new Date(log.timestamp) >= weekAgo).length,
            logsThisMonth: rows.filter(log => new Date(log.timestamp) >= monthAgo).length,
            typeBreakdown: {},
            moodBreakdown: {},
            lastLogDate: rows.length > 0 ? rows[0].timestamp : null
          };

          // Calculate breakdowns
          rows.forEach(log => {
            stats.typeBreakdown[log.type] = (stats.typeBreakdown[log.type] || 0) + 1;
            stats.moodBreakdown[log.mood] = (stats.moodBreakdown[log.mood] || 0) + 1;
          });

          resolve(stats);
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
