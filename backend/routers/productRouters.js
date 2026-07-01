import express from "express";
import {
  addProducts,
  deleteproduct,
  getAllProducts,
  getsingleProduct,
  updateproduct,
} from "../controller/ProductController.js";

const router = express.Router();

router.route("/products").get(getAllProducts).post(addProducts);
//router.get("/product/:id", getsingleProduct);
router
  .route("/product/:id")
  .get(getsingleProduct)
  .put(updateproduct)
  .delete(deleteproduct);

export default router;
