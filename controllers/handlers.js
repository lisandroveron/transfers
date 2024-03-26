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
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send(msg[400].invalidData);
    };
  };

  if (!created) {
    res.status(400).send(msg[400].userAlreadyExists);
  } else {
    res.status(200).send();
  };
};