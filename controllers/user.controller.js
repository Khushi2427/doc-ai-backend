import User from "../models/user.model.js";
export const getProfile = async (req, res) => {
    res.status(200).json({
      success: true,
      user: req.userDoc,
    });
  };
  
  export const updateProfile = async (req, res) => {
    const user = req.userDoc;
  
    user.name = req.body.name || user.name;
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "Profile updated",
      user,
    });
  };
  