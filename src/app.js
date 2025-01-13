const express = require("express");
const app = express();
const cors = require("cors");
const helloRoutes = require("./api/routes/helloRoutes");
const userRoutes = require("./api/routes/userRoutes");
const dbRoutes = require("./api/routes/dbRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/hello", helloRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
