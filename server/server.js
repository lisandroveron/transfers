import express from "express";
import cors from "cors";
import path from "path";
import {login, signup, status} from "./controllers/handlers.js";
import {session} from "./controllers/middlewares.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app
  .use(cors())
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.json())
  .use(session);

app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.post("/api/auth/status", status);

app.listen(process.env.PORT);