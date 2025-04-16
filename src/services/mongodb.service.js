const { MongoClient } = require("mongodb");
require("dotenv").config();

class MongodbService {
  constructor() {
    const uri = `mongodb://${process.env.MONGODB_USER}:${encodeURIComponent(
      process.env.MONGODB_PASS
    )}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${
      process.env.MONGODB_NAME
    }`;

    this.client = new MongoClient(uri, {
      authSource: "admin",
      appName: "CinemaDashboard",
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    this.dbName = process.env.MONGODB_NAME;
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        await this.client.db("admin").command({ ping: 1 });
        this.db = this.client.db(this.dbName);
        this.isConnected = true;
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

  async insertBookingAnalytics(bookingData) {
    try {
      await this.connect();
      const collection = this.db.collection("bookings_analytics");
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

module.exports = new MongodbService();
