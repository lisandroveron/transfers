import Sequelize from "sequelize";
import {User} from "../sequelize/init.js";
import fs from "fs";
import path from "path";
import msg from "./http_messages.js";
import {signedFetch} from "../utils.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const ITEMS_PER_PAGE = 20;
const LANGUAGE = "es";

export function countries(req, res) {
  const pathToFile = path.join(__dirname, "cache/countryCodes.json");
  fs.readFile(pathToFile, (error, countries) => {
    if (error) {
      console.error("Error reading file: ", error);
      return res.status(500).send(msg[500].cantReadResource);
    };

    res.json(JSON.parse(countries));
  });
};

export async function hotels(req, res) {
  const offset = ((req.query.currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const url = `/transfer-cache-api/1.0/hotels` +
      `?fields=code,name` +
      `&language=${LANGUAGE}` +
      `&countryCodes=${req.query.countryCode}` +
      `&offset=${offset}` +
      `&limit=${ITEMS_PER_PAGE}`;

  const hotels = await signedFetch(url);

  if (!hotels) {
    return res.status(204).send();
  };

  res.json(hotels);
};

export async function login(req, res) {
  res.set("Content-Type", "text/plain");

  const {email, password} = req.body;

  const user = await User.findOne({where: {email: email}});

  if (!user || !user.authenticate(password)) {
    return res.status(400).send(msg[400].invalidLogin);
  };

  req.secret = process.env.COOKIE_SECRET;

  res.cookie(process.env.COOKIE_NAME, user.createSessionId(), {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "strict",
    secure: "auto",
    signed: true
  });

  res.status(200).json(user.getAccountInfo());
};

export function search() {
  
};

export async function signup(req, res) {
  res.set("Content-Type", "text/plain");

  try {
    [, created] = await User.findOrCreate({
      where: {email: req.body.email},
      defaults: req.body
    });

    if (!created) {
      res.status(400).send(msg[400].userAlreadyExists);
    } else {
      res.status(201).send(msg[201].successfulRegistered);
    };
  } catch (error) {
    console.error("ERROR", error);

    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send(msg[400].invalidData);
    };
  };
};

export function status(req, res) {
  /*
   * This function is intended to provide a response that mirrors the state
   * structure of the client context, specifically the UserContext used in the
   * React application.
   */
  res.set("Content-Type", "text/plain");

  if (!req.user) {
    return res.status(204).send();
  };

  const user = {
    isLogged: true,
    ...req.user.getAccountInfo()
  };

  res.status(200).json(user);
};

export async function terminals(req, res) {
  const url = 
    `/transfer-cache-api/1.0/locations/terminals` +
    `?fields=code,content` +
    `&language=${LANGUAGE}` +
    `&countryCodes=${req.query.countryCode}`;

  const terminals = await signedFetch(url);

  if (!terminals) {
    res.status(204).send();
    return;
  };

  res.json(terminals);
};