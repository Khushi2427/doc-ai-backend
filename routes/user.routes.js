import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);

export default router;
