import HandleError from "./handleError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModal.js";

export const verifyUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log("Cookies received:", req.cookies);
    console.log("Token:", token);

    if (!token) {
      return next(
        new HandleError("Access denined please login to access", 401),
      );
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token:", decodedData);

    req.user = await User.findById(decodedData.id);
    console.log("User found:", req.user ? "Yes" : "No");

    if (!req.user) {
      return next(new HandleError("User not found", 404));
    }

    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return next(new HandleError(error.message || "Authentication failed", 401));
  }
};

//["admin","superadmin"]
//["user"]
export const rolebasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new HandleError(
          `Role ${req.user.role} is not allowed to access this resoures`,
          403,
        ),
      );
    }
    next();
  };
};
