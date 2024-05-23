/**
 * @fileoverview Defines all middlewares.
 * @module Middlewares
 */
import {parse} from "cookie";
import {unsign} from "cookie-signature";
import User from "../sequelize/models/User.js";

/**
 * Extract the sessionId value from the cookie and populate the req.user object
 * with the appropiate User instance.
 * @param {object} req Express Request object.
 * @param {object} res Express Response object.
 * @param {Function} next Express Next function.
 */
export async function session(req, res, next) {
  if (req.headers.cookie) {
    let sessionId = "";

    sessionId = parse(req.headers.cookie);
    sessionId = sessionId[process.env.COOKIE_NAME].replace("s:", "");
    sessionId = unsign(sessionId, process.env.COOKIE_SECRET);

    const user = await User.findOne({where: {sessionId: sessionId}});

    req.user = user;
  };

  next();
};