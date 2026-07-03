import express from "express";
import {
  addProducts,
  deleteproduct,
  getAllProducts,
  getsingleProduct,
  updateproduct,
  createProductReview,
  viewProductReviews,
} from "../controller/ProductController.js";
import { rolebasedAccess, verifyUser } from "../Helper/UserAuth.js";

const router = express.Router();
//user can see all products and single product
router.get("/products", getAllProducts);
router.get("/product/:id", getsingleProduct);
router.route("/review").put(verifyUser, createProductReview);

//admin can create, update and delete products
router
  .route("/admin/product/create")
  .post(verifyUser, rolebasedAccess("admin"), addProducts);

router
  .route("/admin/products/:id")
  .put(verifyUser, rolebasedAccess("admin"), updateproduct)
  .delete(verifyUser, rolebasedAccess("admin"), deleteproduct);
router
  .route("/admin/review")
  .get(verifyUser, rolebasedAccess("admin"), viewProductReviews);
//admin can see all products
//delete reviews for admin

export default router;
