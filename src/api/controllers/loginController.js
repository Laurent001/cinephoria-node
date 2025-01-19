const dbService = require("../../services/database.service");

const getLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("req.params : ", req.params);
    const [rows] = await dbService.query(
      "SELECT u.*, r.name as role FROM user u JOIN role r ON u.role_id = r.id WHERE u.email = ? AND u.password = ?",
      [email, password]
    );

    if (rows && Object.keys(rows).length > 0) {
      res.json(rows);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du login",
      error: error.message,
    });
  }
};

module.exports = {
  getLogin,
};
