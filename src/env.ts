import dotenv from "dotenv";
import path from "path";

const isRender = !!process.env.RENDER;

if (!isRender) {
  const envPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), ".env_prod")
      : path.resolve(process.cwd(), ".env");

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(
      `Impossible de charger le fichier d'environnement à ${envPath}`
    );
  } else {
    console.log(`Variables d'environnement chargées depuis : ${envPath}`);
  }
} else {
  console.log(
    "Environnement Render détecté : les variables sont injectées par la plateforme."
  );
}

export {};
