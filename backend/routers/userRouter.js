import express from "express";
import {
  loginUser,
  logout,
  registerUser,
  forgetPassword,
  resetPassword,
  profile,
  updatepassword,
  updateProfile,
  getUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../controller/UserController.js";
import { rolebasedAccess, verifyUser } from "../Helper/UserAuth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forget").post(forgetPassword);
router.route("/reset/:token").post(resetPassword);
router.route("/profile").get(verifyUser, profile);
router.route("/password/update").put(verifyUser, updatepassword);
router.route("/profile/update").put(verifyUser, updateProfile);

router
  .route("/admin/users")
  .get(verifyUser, rolebasedAccess("admin"), getUsers);
router
  .route("/admin/users/:id")
  .get(verifyUser, rolebasedAccess("admin"), getSingleUser)
  .put(verifyUser, rolebasedAccess("admin"), updateUserRole)
  .delete(verifyUser, rolebasedAccess("admin"), deleteUser);

export default router;
