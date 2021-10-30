import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import path from "path";

const staticPath = path.join(__dirname, "../../../public");
const staticSettings = express.static(staticPath, {
  maxAge: 31557600000,
  index: "index.html",
});

const app = express();
app.use("/public", staticSettings);
app.use(graphqlUploadExpress());

export default app;
