const mariadb = require("mariadb");
const fs = require("fs").promises;

class DatabaseService {
  constructor() {
    this.pool = mariadb.createPool({
      host: "localhost",
      user: "root",
      password: "gQZXl&t%7N7a8a",
      port: 3307,
      connectionLimit: 5,
    });
  }

  async connect() {
    try {
      this.connection = await this.pool.getConnection();
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
