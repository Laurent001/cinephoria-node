const mariadbService = require("../src/services/mariadb.service.js");
const mongodbService = require("../src/services/mongodb.service.js");
const path = require("path");
const moment = require("moment");

async function setupMariadb() {
  try {
    await mariadbService.connect();
    console.log("Connecté au serveur mariadb");

    const createDatabaseAbsolutePath = path.resolve(
      __dirname,
      "../db/scripts/mariadb/create_database.sql"
    );
    await mariadbService.executeSQL(createDatabaseAbsolutePath);
    console.log("Base de données mariadb créée");

    const fixturesAbsolutePath = path.resolve(
      __dirname,
      "../db/scripts/mariadb/fixtures.sql"
    );
    await mariadbService.executeSQL(fixturesAbsolutePath);
    console.log("Fixtures mariadb importées avec succès");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await mariadbService.close();
    console.log("Database setup completed successfully");
  }
}

async function setupMongoDB() {
  try {
    await mongodbService.connect();
    console.log("Connecté au serveur MongoDB");

    const db = mongodbService.client.db("cinephoria");
    const collection = db.collection("bookings_analytics");

    const films = [
      { film_id: 1, film_title: "Matrix" },
      { film_id: 2, film_title: "Chihiro" },
      { film_id: 3, film_title: "Dune" },
      { film_id: 4, film_title: "Notting Hill" },
      { film_id: 5, film_title: "Pulp Fiction" },
    ];

    const startDate = moment().subtract(7, "days").startOf("day");
    const endDate = moment("2025-09-30").startOf("day");
    const totalDays = endDate.diff(startDate, "days") + 1; // pour inclure le dernier jour
    const fixtures = [];

    for (let day = 0; day < totalDays; day++) {
      const currentDate = moment(startDate).add(day, "days");

      for (const film of films) {
        const numberOfBookings = Math.floor(Math.random() * 126) + 1;

        // lots pour optimiser la mémoire
        const dailyBookings = Array.from(
          { length: numberOfBookings },
          (_, bookingNumber) => ({
            booking_id: `${currentDate.format("YYYYMMDD")}-${film.film_id}-${
              bookingNumber + 1
            }`,
            user_id: Math.floor(Math.random() * 100) + 1,
            film_id: film.film_id,
            film_title: film.film_title,
            timestamp: currentDate
              .clone()
              .add(Math.floor(Math.random() * 1440), "minutes")
              .toDate(),
          })
        );

        fixtures.push(...dailyBookings);
      }
    }

    await collection.deleteMany({});

    const batchSize = 10000;
    for (let i = 0; i < fixtures.length; i += batchSize) {
      const batch = fixtures.slice(i, i + batchSize);
      await collection.insertMany(batch);
      console.log(
        `Lot ${i / batchSize + 1} inséré (${batch.length} documents)`
      );
    }

    console.log(
      `${fixtures.length} réservations générées jusqu'au ${endDate.format(
        "LL"
      )}`
    );
  } catch (error) {
    console.error("Erreur lors de la configuration MongoDB :", error);
  } finally {
    await mongodbService.close();
    console.log("Configuration MongoDB terminée avec succès");
  }
}

setupMariadb();
setupMongoDB();
