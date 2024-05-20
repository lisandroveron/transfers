import express from "express";
import cors from "cors";
import path from "path";
import {
  account,
  bookings,
  categories,
  confirmation,
  countries,
  deleteBookings,
  destinations,
  hotels,
  login,
  search,
  signup,
  status,
  transferTypes,
  terminals,
  vehicleTypes
} from "./controllers/handlers.js";
import {session} from "./controllers/middlewares.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app
  .use(cors())
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.json())
  .use(session);

app.get("/", (req, res) => res.send("index.html"));
app.post("/api/auth/login", login);
app.post("/api/auth/signup", signup);
app.get("/api/auth/status", status);
app.get("/api/hotelbeds/cache/categories", categories);
app.get("/api/hotelbeds/cache/countries", countries);
app.get("/api/hotelbeds/cache/destinations", destinations);
app.get("/api/hotelbeds/cache/hotels", hotels);
app.get("/api/hotelbeds/cache/terminals", terminals);
app.get("/api/hotelbeds/cache/transferTypes", transferTypes);
app.get("/api/hotelbeds/cache/vehicleTypes", vehicleTypes);
app.post("/api/hotelbeds/search", search);
app.put("/api/user/account", account);
app.delete("/api/user/bookings", deleteBookings);
app.get("/api/user/bookings", bookings);
app.post("/api/user/bookings", confirmation);

app.listen(process.env.PORT);