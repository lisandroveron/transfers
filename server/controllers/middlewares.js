import {parse} from "cookie";
import {unsign} from "cookie-signature";
import User from "../sequelize/models/User.js";

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