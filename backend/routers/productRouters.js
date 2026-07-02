import express from "express";
import {
  addProducts,
  deleteproduct,
  getAllProducts,
  getsingleProduct,
  updateproduct,
} from "../controller/ProductController.js";
import { rolebasedAccess, verifyUser } from "../Helper/UserAuth.js";

const router = express.Router();

router
  .route("/products")
  .get(verifyUser, getAllProducts)
  .post(verifyUser, rolebasedAccess("admin"), addProducts);
//router.get("/product/:id", getsingleProduct);
router
  .route("/product/:id")
  .get(getsingleProduct)
  .put(verifyUser, rolebasedAccess("admin"), updateproduct)
  .delete(verifyUser, rolebasedAccess("admin"), deleteproduct);

export default router;
