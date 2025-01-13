const express = require("express");
const router = express.Router();
const filmController = require("../controllers/filmController");

router.get("/", filmController.getFilms);
//router.get("/:id", filmController.getFilmById);

// Routes protégées (nécessitent une authentification)
//router.use(authMiddleware);

//router.put("/:id", filmController.updateFilm);
//router.delete("/:id", filmController.deleteFilm);

module.exports = router;
