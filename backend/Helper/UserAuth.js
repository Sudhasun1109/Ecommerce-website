import HandleError from "./handleError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModal.js";

export const verifyUser = async (req, res, next) => {
  const { token } = req.cookies;
  //console.log(token);
  if (!token) {
    return next(new HandleError("Access denined please login to access", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //console.log(decodedData);
  req.user = await User.findById(decodedData.id);
  //console.log(req.user);
  next();
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
