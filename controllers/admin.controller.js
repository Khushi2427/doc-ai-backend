import User from "../models/user.model.js";
export const adminDashboard = async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
    });
  };
  
  export const getAllUsers = async (req, res) => {
    const users = await User.find().select("-password -refreshTokens");
  
    res.status(200).json({
      success: true,
      users,
    });
  };
  