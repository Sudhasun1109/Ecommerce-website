import express from "express";
import {
  addProducts,
  deleteproduct,
  getAllProducts,
  getsingleProduct,
  updateproduct,
  createProductReview,
  viewProductReviews,
  getallproductsbyadmin,
  adminDeleteReview,
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
  .get(verifyUser, rolebasedAccess("admin"), viewProductReviews).delete(verifyUser, rolebasedAccess("admin"), adminDeleteReview);
//admin can see all products
router
  .route("/admin/products")
  .get(verifyUser, rolebasedAccess("admin"), getallproductsbyadmin);
//delete reviews for admin


export default router;
