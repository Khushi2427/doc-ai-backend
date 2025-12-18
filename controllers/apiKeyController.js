import ApiKey from "../models/ApiKey.js";
import crypto from "crypto";

export const generateApiKey = async (req, res) => {
  const key = crypto.randomBytes(24).toString("hex");

  await ApiKey.create({
    userId: req.user._id,
    key
  });

  res.json({ success: true, key });
};
