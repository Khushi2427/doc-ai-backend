import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";
import crypto from "crypto";



// Helper: Set secure HTTP-only refresh cookie
const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

/* --------------------------------------------------
   @desc   REGISTER USER (user, admin, business)
   @route  POST /api/auth/register
   @access Public
-------------------------------------------------- */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const allowedRoles = ["user", "admin", "business"];
  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Allowed: user, admin, business");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, role });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save hashed refresh token for reuse detection
  const hashed = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshTokens.push({
    token: hashed,
    createdAt: new Date(),
  });

  await user.save();
  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    },
  });
  console.log("New user registered:", user.email);
});

/* --------------------------------------------------
   @desc   LOGIN
   @route  POST /api/auth/login
   @access Public
-------------------------------------------------- */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token
  const hashed = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshTokens.push({ token: hashed, createdAt: new Date() });
  await user.save();

  setRefreshCookie(res, refreshToken);

  user.password = undefined;

  res.json({
    success: true,
    message: "Login successful",
    token: accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    },
  });
  console.log("User logged in:", user.email);
});

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* --------------------------------------------------
   @desc   GOOGLE LOGIN
   @route  POST /api/auth/google
   @access Public
-------------------------------------------------- */
export const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Google token is required");
  }

  try {
    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    if (!email) {
      res.status(400);
      throw new Error("Failed to extract Google account details");
    }

    let user = await User.findOne({ email });

    // If user doesn't exist → create one with Google default role = user
    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(20).toString("hex"), // unused password
        role: "user",
        subscription: "free",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hash refresh token
    const hashed = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Save hashed refresh token
    user.refreshTokens.push({
      token: hashed,
      createdAt: new Date(),
    });

    await user.save();

    // Set secure cookie
    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Google Login Successful",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.log("Google login error:", error);
    res.status(400);
    throw new Error("Google authentication failed");
  }
});

/* --------------------------------------------------
   @desc   LOGOUT (invalidate refresh token)
   @route  POST /api/auth/logout
   @access Private
-------------------------------------------------- */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken && req.user) {
    const hashed = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refreshTokens: { token: hashed } },
    });
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ success: true, message: "Logged out successfully" });
});

/* --------------------------------------------------
   @desc   REFRESH ACCESS TOKEN
   @route  POST /api/auth/refresh
   @access Public (requires refresh cookie)
-------------------------------------------------- */
export const refresh = asyncHandler(async (req, res) => {
  const rToken = req.cookies?.refreshToken;

  if (!rToken) {
    res.status(401);
    throw new Error("Refresh token missing");
  }

  try {
    const payload = verifyRefreshToken(rToken); // { id }
    const user = await User.findById(payload.id);

    if (!user) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }

    const hashedOld = crypto
      .createHash("sha256")
      .update(rToken)
      .digest("hex");

    const found = user.refreshTokens.find((rt) => rt.token === hashedOld);

    if (!found) {
      // Possible stolen token → wipe them all
      user.refreshTokens = [];
      await user.save();

      res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
      res.status(403);
      throw new Error("Possible token reuse detected. Login again.");
    }

    // Rotate tokens
    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    const hashedNew = crypto
      .createHash("sha256")
      .update(newRefresh)
      .digest("hex");

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== hashedOld
    );

    // Add new hashed token
    user.refreshTokens.push({
      token: hashedNew,
      createdAt: new Date(),
    });

    await user.save();
    setRefreshCookie(res, newRefresh);

    res.json({ success: true, token: newAccess });
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }
});

/* --------------------------------------------------
   @desc   GET CURRENT USER
   @route  GET /api/auth/me
   @access Private
-------------------------------------------------- */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshTokens"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, user });
});
