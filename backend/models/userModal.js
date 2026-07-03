import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter your name"],
      maxLength: [
        25,
        "Invalid name. please enter a name with fewer than 25 charagter",
      ],
      minLength: [3, "Name should contain more then 3 characters"],
    },
    email: {
      type: String,
      required: [true, "please enter the email"],
      unique: true,
      validate: [validator.isEmail, "Please Enter your Email"],
    },
    password: {
      type: String,
      required: [true, "Please Enter the password"],
      minLength: [8, "password should be greater than 8 charaters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: [true],
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);
userschema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

userschema.methods.getjwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userschema.methods.verifypassword = async function (userPassword) {
  return await bcryptjs.compare(userPassword, this.password);
};

userschema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", userschema);
