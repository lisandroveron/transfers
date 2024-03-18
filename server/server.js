import express from "express";
import path from "path";
import {sequelize, User} from "./sequelize/init.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.json());

app.listen(process.env.PORT);