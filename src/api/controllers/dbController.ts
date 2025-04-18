import { exec } from "child_process";
import { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSetup = (req: Request, res: Response) => {
  const scriptPath = path.join(__dirname, "..", "..", "..", "db", "setup.ts");

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

export { runSetup };
