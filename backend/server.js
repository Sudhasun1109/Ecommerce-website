import app from "./App.js";
import dotenv from "dotenv";
import { connectDB } from "./config/dp.js";

dotenv.config({ path: "backend/config/config.env" });
const PORT = process.env.PORT || 3000;

connectDB();
process.on("unhandleRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(` is  down,due to uncaught Exception`);

  process.exit(1);
});

const Server = app.listen(PORT, () => {
  console.log(`Server is running on Http://localhost:${PORT}`);
});

process.on("unhandleRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`server is shutting down,due to unjandled rejection`);

  Server.close(() => {
    process.exit(1);
  });
});
