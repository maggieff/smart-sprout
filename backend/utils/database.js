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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          species TEXT,
          variety TEXT,
          description TEXT,
          image_url TEXT,
          health_score REAL DEFAULT 0.8,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `;

      const createSensorDataTable = `
        CREATE TABLE IF NOT EXISTS sensor_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          moisture REAL,
          temperature REAL,
          light REAL,
          humidity REAL,
          ph REAL,
          recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE
        )
      `;

      const createCareLogsTable = `
        CREATE TABLE IF NOT EXISTS care_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plant_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          notes TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `;

      const createAIConversationsTable = `
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          plant_id INTEGER,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          confidence REAL,
          model TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (plant_id) REFERENCES plants (id) ON DELETE CASCADE
        )
      `;

      // Execute all table creation queries
      this.db.serialize(() => {
        this.db.run(createUsersTable, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }
          console.log('Users table created/verified');
        });

        this.db.run(createPlantsTable, (err) => {
          if (err) {
            console.error('Error creating plants table:', err);
            reject(err);
            return;
          }
          console.log('Plants table created/verified');
        });

        this.db.run(createSensorDataTable, (err) => {
          if (err) {
            console.error('Error creating sensor_data table:', err);
            reject(err);
            return;
          }
          console.log('Sensor data table created/verified');
        });

        this.db.run(createCareLogsTable, (err) => {
          if (err) {
            console.error('Error creating care_logs table:', err);
            reject(err);
            return;
          }
          console.log('Care logs table created/verified');
        });

        this.db.run(createAIConversationsTable, (err) => {
          if (err) {
            console.error('Error creating ai_conversations table:', err);
            reject(err);
            return;
          }
          console.log('AI conversations table created/verified');
          resolve();
        });
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

  // Plant data methods
  async createPlant(userId, plantData) {
    return new Promise((resolve, reject) => {
      const { name, species, variety, description, image_url } = plantData;
      const insertPlant = `
        INSERT INTO plants (user_id, name, species, variety, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(insertPlant, [userId, name, species, variety, description, image_url], function(err) {
        if (err) {
          console.error('Error creating plant:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            plant: {
              id: this.lastID,
              user_id: userId,
              name,
              species,
              variety,
              description,
              image_url,
              health_score: 0.8,
              created_at: new Date().toISOString()
            }
          });
        }
      });
    });
  }

  async getPlantsByUserId(userId) {
    return new Promise((resolve, reject) => {
      const selectPlants = `
        SELECT p.*, 
               (SELECT sd.moisture FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_moisture,
               (SELECT sd.temperature FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_temperature,
               (SELECT sd.light FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_light,
               (SELECT sd.humidity FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_humidity
        FROM plants p 
        WHERE p.user_id = ? 
        ORDER BY p.created_at DESC
      `;
      
      this.db.all(selectPlants, [userId], (err, rows) => {
        if (err) {
          console.error('Error getting plants by user ID:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getPlantById(plantId) {
    return new Promise((resolve, reject) => {
      const selectPlant = `
        SELECT p.*, 
               (SELECT sd.moisture FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_moisture,
               (SELECT sd.temperature FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_temperature,
               (SELECT sd.light FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_light,
               (SELECT sd.humidity FROM sensor_data sd WHERE sd.plant_id = p.id ORDER BY sd.recorded_at DESC LIMIT 1) as current_humidity
        FROM plants p 
        WHERE p.id = ?
      `;
      
      this.db.get(selectPlant, [plantId], (err, row) => {
        if (err) {
          console.error('Error getting plant by ID:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async addSensorData(plantId, sensorData) {
    return new Promise((resolve, reject) => {
      const { moisture, temperature, light, humidity, ph } = sensorData;
      const insertSensorData = `
        INSERT INTO sensor_data (plant_id, moisture, temperature, light, humidity, ph)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(insertSensorData, [plantId, moisture, temperature, light, humidity, ph], function(err) {
        if (err) {
          console.error('Error adding sensor data:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            sensorDataId: this.lastID
          });
        }
      });
    });
  }

  async getLatestSensorData(plantId) {
    return new Promise((resolve, reject) => {
      const selectSensorData = `
        SELECT * FROM sensor_data 
        WHERE plant_id = ? 
        ORDER BY recorded_at DESC 
        LIMIT 1
      `;
      
      this.db.get(selectSensorData, [plantId], (err, row) => {
        if (err) {
          console.error('Error getting latest sensor data:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async addCareLog(plantId, userId, action, notes) {
    return new Promise((resolve, reject) => {
      const insertCareLog = `
        INSERT INTO care_logs (plant_id, user_id, action, notes)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(insertCareLog, [plantId, userId, action, notes], function(err) {
        if (err) {
          console.error('Error adding care log:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            logId: this.lastID
          });
        }
      });
    });
  }

  async getCareLogs(plantId, limit = 10) {
    return new Promise((resolve, reject) => {
      const selectCareLogs = `
        SELECT cl.*, u.name as user_name
        FROM care_logs cl
        JOIN users u ON cl.user_id = u.id
        WHERE cl.plant_id = ?
        ORDER BY cl.timestamp DESC
        LIMIT ?
      `;
      
      this.db.all(selectCareLogs, [plantId, limit], (err, rows) => {
        if (err) {
          console.error('Error getting care logs:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async saveAIConversation(userId, plantId, question, answer, confidence, model) {
    return new Promise((resolve, reject) => {
      const insertConversation = `
        INSERT INTO ai_conversations (user_id, plant_id, question, answer, confidence, model)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(insertConversation, [userId, plantId, question, answer, confidence, model], function(err) {
        if (err) {
          console.error('Error saving AI conversation:', err);
          reject(err);
        } else {
          resolve({
            success: true,
            conversationId: this.lastID
          });
        }
      });
    });
  }

  async getAIConversations(userId, plantId = null, limit = 20) {
    return new Promise((resolve, reject) => {
      let selectConversations = `
        SELECT ac.*, p.name as plant_name
        FROM ai_conversations ac
        LEFT JOIN plants p ON ac.plant_id = p.id
        WHERE ac.user_id = ?
      `;
      
      const params = [userId];
      
      if (plantId) {
        selectConversations += ` AND ac.plant_id = ?`;
        params.push(plantId);
      }
      
      selectConversations += ` ORDER BY ac.created_at DESC LIMIT ?`;
      params.push(limit);
      
      this.db.all(selectConversations, params, (err, rows) => {
        if (err) {
          console.error('Error getting AI conversations:', err);
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
