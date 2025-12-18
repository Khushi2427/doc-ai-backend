import cloudinary from "../config/cloudinary.js";

export const uploadDocument = async (req, res) => {
  try {
    console.log("➡️ MULTER FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Upload to Cloudinary
    console.log("➡️ Uploading to Cloudinary...");

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto", // IMPORTANT for pdf, jpg, png
    });

    console.log("✔ CLOUDINARY RESULT:", result);

    return res.json({
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error("🔥 UPLOAD ERROR:", error);
    return res.status(500).json({
      msg: "Upload failed",
      error: error.message,
    });
  }
};
