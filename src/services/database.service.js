const mariadb = require("mariadb");
const fs = require("fs").promises;
require("dotenv").config();

class DatabaseService {
  constructor() {
    this.pool = mariadb.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: parseInt(process.env.DB_PORT, 10),
      connectionLimit: parseInt(process.env.DB_CONNECT_LIMIT, 10),
    });
  }

  async connect(db_name = process.env.DB_NAME) {
    try {
      this.connection = await this.pool.getConnection();
      if (db_name) {
        await this.connection.query(`USE \`${db_name}\``);
      }
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error;
    }
  }

  async query(sql, params) {
    if (!this.connection) {
      await this.connect();
    }
    try {
      const result = await this.connection.query(sql, params);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête :", error);
      throw error;
    }
  }

  async executeSQL(filename) {
    const content = await fs.readFile(filename, "utf8");
    const statements = content
      .split(";")
      .filter((statement) => statement.trim());

    for (const statement of statements) {
      if (statement) {
        try {
          await this.query(statement);
        } catch (error) {
          console.error("Erreur lors de l'exécution de l'instruction :", error);
          throw error;
        }
      }
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.release();
      console.log("Disconnected to the databases server");
      process.exit(0);
    }
  }
}

module.exports = new DatabaseService();
