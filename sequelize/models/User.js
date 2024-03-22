import {DataTypes, Model} from "sequelize";
import sequelize from "../config.js";

class User extends Model {};

User.init({
  // Attributes
  firstname: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Options
  sequelize,
  tableName: "Users"
});

export default User;