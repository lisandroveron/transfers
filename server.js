import express from "express";
import path from "path";

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.json());

app.listen(process.env.PORT);