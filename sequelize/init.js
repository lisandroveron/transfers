import sequelize from "./config.js";
import User from "./models/Users.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database.");
    
    await sequelize.sync({alter: true});
    console.log("Models synchronized successful.");
  } catch (error) {
    console.error("Could not connect to the database:", error);
  };
})();

export {sequelize, User};