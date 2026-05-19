import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class Database {

  async connect() {

    try {

      await mongoose.connect(
        process.env.MONGO_URI
      );

      console.log(
        "✓ MongoDB Connected"
      );

    }
    catch(error){

      console.error(
        "✗ MongoDB Connection Error:",
        error.message
      );

      process.exit(1);

    }

  }

  async disconnect(){

    try{

      await mongoose.disconnect();

      console.log(
        "✓ MongoDB Disconnected"
      );

    }
    catch(error){

      console.error(
        "Disconnect Error:",
        error.message
      );

    }

  }

}

export default Database;