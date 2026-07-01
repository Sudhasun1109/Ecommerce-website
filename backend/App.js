import express from "express";
import product from "./routers/productRouters.js";
import errorhandler from "./middlewara/Error.js";

const app = express();
app.use(express.json());
//router
app.use("/api/v1/", product);
app.use(errorhandler);
export default app;
