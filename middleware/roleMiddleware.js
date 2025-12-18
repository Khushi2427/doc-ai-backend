// middleware/roleMiddleware.js

// ✔ Business users OR Admin users can access business routes
export const businessMiddleware = (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }
  
    if (req.user.role === "business" || req.user.role === "admin") {
      return next();
    }
  
    res.status(403);
    throw new Error("Business resource. Access denied.");
  };
  
  // ✔ Admin-only middleware
  export const adminMiddleware = (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }
  
    if (req.user.role !== "admin") {
      res.status(403);
      throw new Error("Admin resource. Access denied.");
    }
  
    next();
  };
  
  // ✔ Subscription middleware
  export const requireSubscription = (...allowedPlans) => {
    return (req, res, next) => {
      if (!req.userDoc) {
        res.status(401);
        throw new Error("No user found in request");
      }
  
      const userSub = req.userDoc.subscription?.plan || "free";
  
      if (!allowedPlans.includes(userSub)) {
        res.status(403);
        throw new Error(
          `This feature requires one of these plans: ${allowedPlans.join(", ")}`
        );
      }
  
      next();
    };
  };
  