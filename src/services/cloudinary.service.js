const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const DIR_PUBLIC_IMAGES = "public/images";
let upload;

if (process.env.NODE_ENV === "production") {
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: DIR_PUBLIC_IMAGES,
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      public_id: (req, file) => file.originalname,
      // transformation: [{ width: 500, height: 750, crop: "limit" }]
    },
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
} else {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, DIR_PUBLIC_IMAGES);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

const deleteFromCloudinary = async (filename) => {
  if (!filename) return;
  try {
    await cloudinary.uploader.destroy(`DIR_PUBLIC_IMAGES/${filename}`);
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'image Cloudinary:",
      error
    );
  }
};

module.exports = { upload, deleteFromCloudinary };
