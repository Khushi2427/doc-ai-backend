import express from "express";
import {
  protect,
  adminMiddleware,
} from "../middleware/authMiddleware.js";
import { adminDashboard, getAllUsers } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", protect, adminMiddleware, adminDashboard);
router.get("/users", protect, adminMiddleware, getAllUsers);

export default router;
