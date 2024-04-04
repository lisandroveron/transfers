import Sequelize from "sequelize";
import {User} from "../sequelize/init.js";
import msg from "./http_messages.js";

export async function signup(req, res) {
  let [user, created] = [null, null];

  try {
    [user, created] = await User.findOrCreate({
      where: {email: req.body.email},
      defaults: req.body
    });
  } catch (error) {
    console.error("ERROR", error);
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send(msg[400].invalidData);
    };
  };

  if (!user) {
    res.status(400).send(msg[400].userAlreadyExists);
  } else {
    res.status(200).send(msg[200].successfulRegistered);
  };
};

export async function login(req, res) {
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

  res.status(200).send(JSON.stringify(user.getAccountInfo()));
};