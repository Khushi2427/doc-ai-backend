import express from 'express';
import { register, login, logout, refresh, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { googleLogin } from "../controllers/authController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh); // refresh is called by frontend to get new access token (cookie-based)
router.get('/me', protect, getMe);
router.post("/google", googleLogin);


export default router;
