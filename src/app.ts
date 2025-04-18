import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./api/routes/adminRoutes";
import bookingRoutes from "./api/routes/bookingRoutes";
import cinemaRoutes from "./api/routes/cinemaRoutes";
import contactRoutes from "./api/routes/contactRoutes";
import dbRoutes from "./api/routes/dbRoutes";
import emailRoutes from "./api/routes/emailRoutes";
import filmRoutes from "./api/routes/filmRoutes";
import genreRoutes from "./api/routes/genreRoutes";
import incidentRoutes from "./api/routes/incidentRoutes";
import intranetRoutes from "./api/routes/intranetRoutes";
import loginRoutes from "./api/routes/loginRoutes";
import logoutRoutes from "./api/routes/logoutRoutes";
import opinionRoutes from "./api/routes/opinionRoutes";
import qrcodeRoutes from "./api/routes/qrcodeRoutes";
import registerRoutes from "./api/routes/registerRoutes";
import screeningRoutes from "./api/routes/screeningRoutes";
import spaceRoutes from "./api/routes/spaceRoutes";
import userRoutes from "./api/routes/userRoutes";
import authMiddleware from "./middleware/authMiddleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

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
app.use("/api/qrcode", qrcodeRoutes);
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

export default app;
