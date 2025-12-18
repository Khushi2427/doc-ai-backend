export const requireSubscription = (...allowedPlans) => {
    return (req, res, next) => {
      const user = req.userDoc; // comes from protect middleware
  
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
  
      const userPlan = user.subscription.plan;
  
      if (!allowedPlans.includes(userPlan)) {
        return res.status(403).json({
          success: false,
          message: `This feature is available only for: ${allowedPlans.join(", ")}`,
        });
      }
  
      next();
    };
  };
  