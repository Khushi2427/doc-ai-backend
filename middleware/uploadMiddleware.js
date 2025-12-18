import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if not exists
const uploadPath = "uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File type filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter
});
