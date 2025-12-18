import express from "express";
import {
  businessMiddleware,
  requireSubscription,
} from "../middleware/roleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

import {
  businessApiHandler,
  extractAI,
} from "../controllers/business.controller.js";

const router = express.Router();

// ✔ Example Business Route (only Business or Enterprise users)
router.get(
  "/business-api",
  protect,                           // User must be logged in
  businessMiddleware,                // Must be role = business
  requireSubscription("business", "enterprise"), 
  businessApiHandler                 // Controller
);

// ✔ AI Extraction Route (Pro, Business, or Enterprise)
router.get(
  "/advanced-extraction",
  protect,                           // User must be logged in
  requireSubscription("pro", "business", "enterprise"),
  extractAI
);

export default router;
