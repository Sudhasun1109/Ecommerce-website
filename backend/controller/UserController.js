import HandleError from "../Helper/handleError.js";
import { sendToken } from "../Helper/jwttoken.js";
import { sendEmail } from "../Helper/sendEmail.js";
import User from "../models/userModal.js";
import crypto from "crypto";

//user registration code
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
//user login code
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
//user logout code
export const logout = async (req, res, next) => {
  const option = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };
  res.cookie("token", null, option);
  res.status(200).json({ success: true, message: "Successfully logged out" });
};

//forget Password code

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
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new HandleError("Email could not be send try again leter..", 500),
    );
  }
};
//Reset Password code mail send function
export const resetPassword = async (req, res, next) => {
  const resetToken = req.params.token;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  // Debug: check if user exists at all
  if (!user) {
    const userCheck = await User.findOne({ resetPasswordToken });

    return next(new HandleError("Invalid or expired reset token", 400));
  }
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return next(new HandleError("Password fields cannot be empty", 400));
  }
  if (password !== confirmPassword) {
    return next(new HandleError("Passwords do not match", 400));
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
};
// GET user profile
export const profile = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
};
// Update user password
export const updatepassword = async (req, res, next) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.user.id:", req.user?.id);

    if (!req.user || !req.user.id) {
      return next(new HandleError("User not authenticated", 401));
    }

    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return next(new HandleError("All password fields are required", 400));
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new HandleError("User not found", 404));
    }

    const iscorrect = await user.verifypassword(oldPassword);
    if (!iscorrect) {
      return next(new HandleError("Old password is incorrect", 400));
    }
    if (newPassword !== confirmNewPassword) {
      return next(new HandleError("New passwords do not match", 400));
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    console.error("Error in updatepassword:", error);
    return next(new HandleError(error.message, 500));
  }
};
// Update user profile
export const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  const updateUserDetails = { name, email };
  const user = await User.findByIdAndUpdate(req.user.id, updateUserDetails, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new HandleError("User not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
};

//get all users for admin
export const getUsers = async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
};

//get single user for admin
export const getSingleUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new HandleError("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
};
//update user role for admin
export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  const id = req.params.id;
  const updatedRole = { role };
  const user = await User.findByIdAndUpdate(id, updatedRole, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new HandleError("User not found", 400));
  }
  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user,
  });
};

//delete user for admin
export const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new HandleError("User not found", 400));
  }
  const deletedUser = await User.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};
