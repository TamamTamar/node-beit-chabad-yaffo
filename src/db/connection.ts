import mongoose from "mongoose";
import { Logger } from "../logs/logger";




const connect = async () => {
  //load the value from .env
  const connectionString = process.env.DB_CONNECTION_STRING;

  //check if the value exists
  if (!connectionString) {
    Logger.log("DB_CONNECTION_STRING is not defined in your .env file");
    return;
  }
  try {
    await mongoose.connect(connectionString);



    console.log("Database Connected" + connectionString);
  } catch (e) {
    Logger.log("Database not connected" + e + connectionString);
  }
};

export default connect;
