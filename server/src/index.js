import dotenv from "dotenv";
// import connectDB from "./db/index.db.js";
import { app } from "./app.js";

dotenv.config({
  path: './.env'
});

// connectDB()
//   .then(() => {
    app.listen(process.env.PORT || 8000 );
    console.log(`app is listening at port ${process.env.PORT} or 8000`);
  // }
  // ).catch((error) => {
  //   console.log(`Could not connect to database ${error}`);
  // }
  // );