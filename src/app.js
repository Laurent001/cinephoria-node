const express = require("express");
const app = express();
const cors = require("cors");
const helloRoutes = require("./api/routes/helloRoutes");
const userRoutes = require("./api/routes/userRoutes");
const filmRoutes = require("./api/routes/filmRoutes");
const dbRoutes = require("./api/routes/dbRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/hello", helloRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/users", userRoutes);
app.use("/api/films", filmRoutes);

module.exports = app;
