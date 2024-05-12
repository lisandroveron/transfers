import sequelize from "./config.js";
import User from "./models/User.js";
import Transfer from "./models/Transfer.js";

User.hasMany(Transfer, {onDelete: "CASCADE"});
Transfer.belongsTo(User);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database.");
    
    await sequelize.sync({alter: true, match: /_test$/});
    console.log("Models synchronized successful.");
  } catch (error) {
    console.error("Could not connect to the database:", error);
  };
})();

export {sequelize, User, Transfer};