import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware, businessMiddleware } from "../middleware/authMiddleware.js";
import { requireSubscription } from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/public", (req, res) => {
  res.json({ message: "Public route working" });
});

// AUTH ONLY
router.get("/protected", protect, (req, res) => {
  res.json({ message: "Protected route OK", user: req.user });
});

// ADMIN ONLY
router.get("/admin", protect, adminMiddleware, (req, res) => {
  res.json({ message: "Admin route OK", user: req.user });
});

// BUSINESS ONLY
router.get("/business", protect, businessMiddleware, (req, res) => {
  res.json({ message: "Business route OK", user: req.user });
});

// PREMIUM/PRO users
router.get(
  "/premium-data",
  protect,
  requireSubscription("pro", "business", "enterprise"),
  (req, res) => {
    res.json({ message: "Premium data available", user: req.user });
  }
);

// BUSINESS API ACCESS
router.get(
  "/business-api",
  protect,
  businessMiddleware,
  requireSubscription("business", "enterprise"),
  (req, res) => {
    res.json({ message: "Business API access granted" });
  }
);

export default router;
