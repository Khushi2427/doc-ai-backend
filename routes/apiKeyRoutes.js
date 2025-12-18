import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateApiKey } from "../controllers/apiKeyController.js";

const router = express.Router();

router.post("/generate", protect, generateApiKey);

export default router;
