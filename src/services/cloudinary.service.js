const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const DIR_PUBLIC_IMAGES = "public/images";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage =
  process.env.NODE_ENV !== "development"
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, "../../" + DIR_PUBLIC_IMAGES));
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

const uploadToCloudinary = async (file) => {
  try {
    const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: DIR_PUBLIC_IMAGES,
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      public_id: file.filename,
    });
    return result;
  } catch (error) {
    console.error("Erreur lors du téléchargement sur Cloudinary:", error);
    throw error;
  }
};

const deleteFromCloudinary = async (filename) => {
  if (!filename) return;

  try {
    const filenameWithoutExtension = filename.split(".").slice(0, -1).join(".");
    await cloudinary.uploader.destroy(
      DIR_PUBLIC_IMAGES + "/" + filenameWithoutExtension
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'image cloudinary :",
      error
    );
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
