import cloudinary from "cloudinary";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage =
  process.env.NODE_ENV === "production"
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, "../../" + process.env.DIR_IMAGES));
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      });

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées (jpeg, jpg, png, gif)"));
    }
  },
});

const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.v2.uploader.upload(fileBase64, {
      folder: process.env.CLOUDINARY_DIR_IMAGES,
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      public_id: file.filename,
    });
    return result;
  } catch (error) {
    console.error("Erreur lors du téléchargement sur Cloudinary:", error);
    throw error;
  }
};

const deleteFromCloudinary = async (filename: string) => {
  if (!filename) return;

  try {
    const filenameWithoutExtension = filename.split(".").slice(0, -1).join(".");
    await cloudinary.v2.uploader.destroy(
      process.env.CLOUDINARY_DIR_IMAGES + "/" + filenameWithoutExtension
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'image cloudinary :",
      error
    );
  }
};

export { deleteFromCloudinary, upload, uploadToCloudinary };
