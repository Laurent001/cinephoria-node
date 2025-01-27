const databaseService = require("../src/services/database.service.js");
const path = require("path");

async function setupDatabase() {
  try {
    await databaseService.connect();
    console.log("Connected to the databases server");

    const createDatabaseAbsolutePath = path.resolve(
      __dirname,
      "../db/scripts/create_database.sql"
    );
    await databaseService.executeSQL(createDatabaseAbsolutePath);
    console.log("Database created");

    const fixturesAbsolutePath = path.resolve(
      __dirname,
      "../db/scripts/fixtures.sql"
    );
    await databaseService.executeSQL(fixturesAbsolutePath);
    console.log("Fixtures imported");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await databaseService.close();
    console.log("Database setup completed successfully");
  }
}

setupDatabase();
