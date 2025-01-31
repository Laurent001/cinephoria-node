const express = require("express");
const app = express();

const loginRoutes = require("./api/routes/loginRoutes");
const logoutRoutes = require("./api/routes/logoutRoutes");
const registerRoutes = require("./api/routes/registerRoutes");
const userRoutes = require("./api/routes/userRoutes");
const filmRoutes = require("./api/routes/filmRoutes");
const genreRoutes = require("./api/routes/genreRoutes");
const dbRoutes = require("./api/routes/dbRoutes");
const bookingRoutes = require("./api/routes/bookingRoutes");
const contactRoutes = require("./api/routes/contactRoutes");
const incidentRoutes = require("./api/routes/incidentRoutes");
const intranetRoutes = require("./api/routes/intranetRoutes");
const adminRoutes = require("./api/routes/adminRoutes");
const spaceRoutes = require("./api/routes/spaceRoutes");
const cinemaRoutes = require("./api/routes/cinemaRoutes");
const screeningRoutes = require("./api/routes/screeningRoutes");
const emailRoutes = require("./api/routes/emailRoutes");
const authMiddleware = require("./middleware/authMiddleware");

//app.use(cors());
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders:
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.options("*", cors());
app.use(express.json());

app.get("/api/example", (req, res) => {
  console.log("Headers:", res.getHeaders());
  res.json({ message: "Hello, world!" });
});

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/film", filmRoutes);
app.use("/genre", genreRoutes);
app.use("/cinema", cinemaRoutes);
app.use("/screening", screeningRoutes);
app.use("/api", emailRoutes);
app.use("/api/db", dbRoutes);

app.use("/api", authMiddleware);

app.use("/api/logout", logoutRoutes);
app.use("/api/user", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/incident", incidentRoutes);
app.use("/api/intranet", intranetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/space", spaceRoutes);

module.exports = app;
