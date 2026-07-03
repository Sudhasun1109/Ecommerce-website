import errorHandler from "../Helper/handleError.js";
import Product from "../models/productModel.js";
import APIHelper from "../Helper/APIHelper.js";
// Create products

export const addProducts = async (req, res, next) => {
  //console.log(req.body);
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
};
//updatte product
export const updateproduct = async (req, res, next) => {
  const id = req.params.id;
  console.log("Updating product with ID:", id);
  console.log("Update data:", req.body);

  let product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    console.log("Product not found for ID:", id);
    // Try to find if product exists at all
    const existingProduct = await Product.findById(id);
    console.log(
      "Product exists check:",
      existingProduct ? "Found" : "Not found",
    );
    return next(new errorHandler("product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
};
//delete the products
export const deleteproduct = async (req, res) => {
  const id = req.params.id;
  let product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new errorHandler("product not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Product delete  success",
  });
};

// GetAllproducts from db
//Http://localhost:8000/api/v1/products?keyword=Smart Watch
export const getAllProducts = async (req, res, next) => {
  //const products = await Product.find();
  //console.log(req.query.keyword);
  const resultperpage = 4;
  const apiHelper = new APIHelper(Product.find(), req.query).search().filter();
  const filteredQuery = apiHelper.query.clone();
  const productcount = await filteredQuery.countDocuments();

  const totalpages = Math.ceil(productcount / resultperpage);
  const page = Number(req.query.page) || 1;

  if (totalpages > 0 && page > totalpages) {
    return next(new errorHandler("this page doesn't exist", 404));
  }
  apiHelper.pagination(resultperpage);
  const products = await apiHelper.query;
  res.status(200).json({
    success: true,
    products,
    productcount,
    totalpages,
    currentpage: page,
  });
};
//getsingleproduct id
export const getsingleProduct = async (req, res, next) => {
  const id = req.params.id;
  let product = await Product.findById(id);

  if (!product) {
    return next(new errorHandler("product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
};

export const createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new errorHandler("Product not found", 400));
  }
  const existingReview = product.review.find(
    (review) =>
      (review.user.toString() === req.user._id.toString()) == req.user.id,
  );
  if (existingReview) {
    // Update existing review
    product.review.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.rating = rating;
        review.comment = comment;
      }
    });
  } else {
    // add push review
    product.review.push(review);
  }
  //update review count
  product.numOfReviews = product.review.length;

  //update average rating
  let sum = 0;
  product.review.forEach((review) => {
    sum += review.rating;
  });
  product.rating = product.review.length > 0 ? sum / product.review.length : 0;

  //sace details
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    message: "Review added successfully",
    product,
  });
};

export const viewProductReviews = async (req, res, next) => {
  const productId = await Product.findById(req.query.id);
  if (!productId) {
    return next(new errorHandler("Product not found", 400));
  }
  res.status(200).json({
    success: true,
    reviews: productId.review,
  });
};
