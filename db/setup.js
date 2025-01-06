const databaseService = require("../services/database.service.js");
const path = require("path");

async function setupDatabase() {
  try {
    await databaseService.connect();
    console.log("Connected to the databases server");

    const createDatabaseAbsolutePath = path.resolve(
      __dirname,
      "../scripts/database/create_database.sql"
    );
    await databaseService.executeSQL(createDatabaseAbsolutePath);
    console.log("Database created");

    const fixturesAbsolutePath = path.resolve(
      __dirname,
      "../scripts/database/fixtures.sql"
    );
    console.log("Fixtures imported");
    await databaseService.executeSQL(fixturesAbsolutePath);

    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await databaseService.close();
  }
}

setupDatabase();
