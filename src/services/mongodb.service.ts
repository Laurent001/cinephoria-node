import dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";

dotenv.config();

class MongodbService {
  public client: MongoClient;
  private db: Db | null = null;
  private dbName: string;
  private isConnected: boolean = false;

  constructor() {
    const user = process.env.MONGODB_USER;
    const pass = process.env.MONGODB_PASS;
    const host = process.env.MONGODB_HOST;
    const port = process.env.MONGODB_PORT;
    const name = process.env.MONGODB_NAME;

    if (!user || !pass || !host || !port || !name) {
      throw new Error(
        "Une ou plusieurs variables d'environnement MongoDB sont manquantes"
      );
    }

    const uri = `mongodb://${user}:${encodeURIComponent(
      pass
    )}@${host}:${port}/${name}`;

    this.client = new MongoClient(uri, {
      authSource: "admin",
      appName: "CinemaDashboard",
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    this.dbName = name;
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        await this.client.db("admin").command({ ping: 1 });
        this.db = this.client.db(this.dbName);
        this.isConnected = true;
        console.log("Connecté à MongoDB");
      } catch (error) {
        console.error("Échec de connexion MongoDB:", error);
        throw error;
      }
    }
  }

  async close() {
    if (this.isConnected) {
      try {
        await this.client.close();
        this.isConnected = false;
        console.log("Déconnecté de MongoDB");
      } catch (error) {
        console.error("Échec de déconnexion MongoDB:", error);
        throw error;
      }
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error("La base de données MongoDB n'est pas connectée.");
    }
    return this.db;
  }

  async insertBookingAnalytics(bookingData: any) {
    try {
      await this.connect();
      const collection = this.getDatabase().collection("bookings_analytics");
      const result = await collection.insertOne({
        ...bookingData,
        timestamp: new Date(),
      });
      return result;
    } catch (error) {
      console.error("Erreur d'écriture MongoDB:", error);
      throw error;
    }
  }
}

export default new MongodbService();
