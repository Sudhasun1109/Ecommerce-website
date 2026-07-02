import express from "express";
import {
  loginUser,
  logout,
  registerUser,
  resetPassword,
} from "../controller/UserController.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forget").post(resetPassword);

export default router;
