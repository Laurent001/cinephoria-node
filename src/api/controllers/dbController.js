const { exec } = require("child_process");
const path = require("path");

const runSetup = (req, res) => {
  const scriptPath = path.join(__dirname, "..", "..", "..", "db", "setup.js");

  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur d'exécution: ${error}`);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'exécution du script" });
    }
    if (stderr) {
      console.error(`Erreur standard: ${stderr}`);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'exécution du script" });
    }
    console.log(`Sortie du script: ${stdout}`);
    res
      .status(200)
      .json({ message: "Script exécuté avec succès", output: stdout });
  });
};

module.exports = {
  runSetup,
};
