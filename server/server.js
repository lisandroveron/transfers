import express from "express";
import cors from "cors";
import path from "path";
import {
  bookings,
  confirmation,
  countries,
  deleteBookings,
  destinations,
  hotels,
  login,
  search,
  signup,
  status,
  terminals
} from "./controllers/handlers.js";
import {session} from "./controllers/middlewares.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

app
  .use(cors())
  .use(express.static(path.join(__dirname, "dist")))
  .use(express.json())
  .use(session);

app.post("/api/auth/login", login);
app.post("/api/auth/signup", signup);
app.get("/api/auth/status", status);
app.post("/api/hotelbeds/booking/confirmation", confirmation);
app.get("/api/hotelbeds/cache/countries", countries);
app.get("/api/hotelbeds/cache/destinations", destinations);
app.get("/api/hotelbeds/cache/hotels", hotels);
app.get("/api/hotelbeds/cache/terminals", terminals);
app.post("/api/search", search);
app.get("/api/user/bookings", bookings);
app.delete("/api/user/bookings", deleteBookings);

app.listen(process.env.PORT);