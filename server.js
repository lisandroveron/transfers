import express from "express";
import cors from "cors";
import path from "path";
import {signup} from "./controllers/handlers.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app
  .use(cors())
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.json());

app.post("/api/auth/signup", signup);

app.listen(process.env.PORT);