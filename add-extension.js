import fs from "fs";
import path from "path";

// Fonction pour ajouter .js à tous les imports sauf ceux de packages
function addJsExtensionToImports(filePath) {
  let fileContent = fs.readFileSync(filePath, "utf-8");

  // Utilisation d'une expression régulière pour ajouter ".js" aux imports locaux (pas aux modules externes)
  const updatedContent = fileContent.replace(
    /import\s+.*\s+from\s+["']([^"']+)["']/g,
    (match, p1) => {
      // On ne touche pas aux imports qui viennent de modules externes (par exemple "express")
      if (!p1.startsWith(".") && !p1.includes("/")) {
        return match;
      }
      // Sinon, on ajoute ".js" aux imports relatifs
      return match.replace(p1, `${p1}.js`);
    }
  );

  // Sauvegarde du fichier modifié
  if (updatedContent !== fileContent) {
    fs.writeFileSync(filePath, updatedContent, "utf-8");
    console.log(`Updated: ${filePath}`);
  }
}

// Fonction pour parcourir les fichiers .ts dans un dossier donné
function updateImportsInDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    // Si c'est un fichier TypeScript (.ts), on l'update
    if (stats.isFile() && filePath.endsWith(".ts")) {
      addJsExtensionToImports(filePath);
    }

    // Si c'est un dossier, on le parcourt récursivement
    if (stats.isDirectory()) {
      updateImportsInDir(filePath);
    }
  });
}

// Utiliser import.meta.url pour obtenir le répertoire actuel
const sourceDir = path.dirname(new URL(import.meta.url).pathname);

// Lancer l'ajout des extensions .js dans tous les fichiers .ts
updateImportsInDir(sourceDir);
