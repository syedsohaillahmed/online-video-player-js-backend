import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log("connected")

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("connectionInstance", connectionInstance)
    console.log(
      `\n mongoDb connected at DB Host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("connection try catch error", error);
    process.exit(1);
  }
};

export default connectDB
