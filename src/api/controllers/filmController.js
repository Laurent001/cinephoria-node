const dbService = require("../../services/database.service");

const getFilms = async (req, res) => {
  try {
    const rows = await dbService.query(
      `SELECT 
        f.id,
        f.title,
        f.description,
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
        f.release_date,
        f.age_minimum,
        f.favorite,
        f.poster
      FROM 
        film f
      LEFT JOIN 
        film_genre fg ON f.id = fg.film_id
      LEFT JOIN 
        genre g ON fg.genre_id = g.id
      GROUP BY 
        f.id`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

module.exports = {
  getFilms,
};
