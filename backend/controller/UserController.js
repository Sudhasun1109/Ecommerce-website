import HandleError from "../Helper/handleError.js";
import { sendToken } from "../Helper/jwttoken.js";
import { sendEmail } from "../Helper/sendEmail.js";
import User from "../models/userModal.js";
import crypto from "crypto";

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    return next(new HandleError("Namecannot be empty", 400));
  }
  if (!email) {
    return next(new HandleError("Email cannot be empty", 400));
  }
  if (!password) {
    return next(new HandleError(" password cannot be empty", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "temp_id",
      url: "temp_url",
    },
  });

  sendToken(user, 201, res);
  const token = user.getjwtToken();
  res.status(201).json({
    success: true,
    user,
    token,
  });
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new HandleError("Email or Password connot be empty", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new HandleError("Invalid Eamil id or Password", 401));
  }
  const isValidpassword = await user.verifypassword(password);
  if (!isValidpassword) {
    return next(new HandleError("Invalid Eamil id or Password", 401));
  }
  sendToken(user, 201, res);
};

export const logout = async (req, res, next) => {
  const option = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };
  res.cookie("token", null, option);
  res.status(200).json({ success: true, message: "Successfully logged out" });
};

//Reset Password

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HandleError("User does not existe", 400));
  }
  let resetToken;
  try {
    resetToken = user.createPasswordResetToken();
    await user.save();
    console.log(resetToken);
  } catch (error) {
    console.log(error);
    return next(
      new HandleError("Could not save reset token,Try again later", 500),
    );
  }

  const resetpasswordURL = `${req.protocol}://${req.host}/reset/${resetToken}`;
  console.log(resetpasswordURL);
  const message = `Reset Your password using the link below :\n${resetpasswordURL}\n\nThe link expires in 30 minutes.\n\n If wasn't you,please ignore this message:`;
  try {
    await sendEmail({
      email: user.email,
      subject: "password Reset Request",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email is sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExprire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new HandleError("Email could not be send try again leter..", 500),
    );
  }
};

export const resetPassword = async (req, res, next) => {
  const resetToken = req.params.token;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExprire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new HandleError("Invalid or expired reset token", 400));
  }
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return next(new HandleError("Password fields cannot be empty", 400));
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExprire = undefined;
  await user.save();
  sendToken(user, 200, res);
};
