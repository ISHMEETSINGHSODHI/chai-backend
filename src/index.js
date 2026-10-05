import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);