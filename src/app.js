const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

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
const opinionRoutes = require("./api/routes/opinionRoutes");
const intranetRoutes = require("./api/routes/intranetRoutes");
const adminRoutes = require("./api/routes/adminRoutes");
const spaceRoutes = require("./api/routes/spaceRoutes");
const cinemaRoutes = require("./api/routes/cinemaRoutes");
const screeningRoutes = require("./api/routes/screeningRoutes");
const emailRoutes = require("./api/routes/emailRoutes");
const authMiddleware = require("./middleware/authMiddleware");

app.use(cors());
app.use(express.json());

app.use("/images", async (req, res, next) => {
  // console.log("Current NODE_ENV:", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "production") {
    try {
      const imageName = req.path.substring(1);
      const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${process.env.CLOUDINARY_DIR_IMAGES}/${imageName}`;
      res.redirect(cloudinaryUrl);
    } catch (error) {
      console.error("Error:", error);
      next(error);
    }
  } else {
    express.static(path.join(__dirname, "..", "public", "images"))(
      req,
      res,
      next
    );
  }
});

app.use("/api/login", loginRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/film", filmRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/cinema", cinemaRoutes);
app.use("/api/screening", screeningRoutes);
app.use("/api/mail", emailRoutes);
app.use("/api/db", dbRoutes);

app.use("/api", authMiddleware);

app.use("/api/logout", logoutRoutes);
app.use("/api/user", userRoutes);
app.use("/api/opinion", opinionRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/incident", incidentRoutes);
app.use("/api/intranet", intranetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/space", spaceRoutes);

module.exports = app;
