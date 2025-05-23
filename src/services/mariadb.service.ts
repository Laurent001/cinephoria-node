import "../../src/env.js";
import fs from "fs/promises";
import mariadb from "mariadb";

class MariadbService {
  connection: mariadb.PoolConnection | null = null;
  pool: mariadb.Pool;
  constructor() {
    this.pool = mariadb.createPool({
      host: process.env.MARIADB_HOST,
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASS,
      port: process.env.MARIADB_PORT
        ? parseInt(process.env.MARIADB_PORT, 10)
        : 3306,
      connectionLimit: process.env.MARIADB_CONNECT_LIMIT
        ? parseInt(process.env.MARIADB_CONNECT_LIMIT, 10)
        : 5,
    });
  }

  async connect(db_name?: string) {
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

  async query(sql: string, params: any[] = []) {
    if (!this.connection && process.env.MARIADB_NAME) {
      await this.connect(process.env.MARIADB_NAME);
    }
    try {
      const result = await this.connection!.query(sql, params);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête :", error);
      throw error;
    }
  }

  async executeTransaction(callback: any) {
    try {
      if (!this.connection && process.env.MARIADB_NAME) {
        await this.connect(process.env.MARIADB_NAME);
      }
      await this.connection!.beginTransaction();
      const result = await callback(this.connection);
      await this.connection!.commit();
      return result;
    } catch (error) {
      await this.connection!.rollback();
      console.error("Erreur lors de l'exécution de la transaction :", error);
      throw error;
    }
  }

  async executeSQL(filename: string) {
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

export default new MariadbService();
