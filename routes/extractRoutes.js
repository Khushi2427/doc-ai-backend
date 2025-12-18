import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  summarizeDocument,
  extractDetails,
  convertToCsv
  
} from "../controllers/extractController.js";

const router = express.Router();

// POST /api/extract/summary
router.post("/summary", protect, summarizeDocument);

// POST /api/extract/details
router.post("/details", protect, extractDetails);

// POST /api/extract/details/csv   <-- NEW ROUTE
router.post("/details/csv", protect, convertToCsv);

export default router;
