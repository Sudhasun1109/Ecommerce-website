import express from "express";
import product from "./routers/productRouters.js";
import errorhandler from "./middlewara/Error.js";
import user from "./routers/userRouter.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
//router
app.use("/api/v1/", product);
app.use("/api/v1/", user);
app.use(errorhandler);
export default app;
