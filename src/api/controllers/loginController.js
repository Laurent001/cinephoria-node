const dbService = require("../../services/database.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await dbService.query(
      "SELECT u.*, r.name as role FROM user u JOIN role r ON u.role_id = r.id WHERE u.email = ?",
      [email]
    );

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        const token = jwt.sign(
          { id: user.id.toString(), email: user.email },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.json({ user: { ...user, password: undefined }, token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
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
