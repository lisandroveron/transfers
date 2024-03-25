import {DataTypes, Model} from "sequelize";
import sequelize from "../config.js";

class User extends Model {};

User.init({
  // Attributes
  firstname: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: [2, 64],
      is: /[a-zA-ZáéíóúÁÉÍÓÚñ ]+/g
    }
  },
  lastname: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: [2, 64],
      is: /[a-zA-ZáéíóúÁÉÍÓÚñ ]+/g
    }
  },
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    primaryKey: true,
    unique: true,
    validate: {
      len: [10, 64],
      is: /[a-zA-Z0-9.]+@(hotmail|outlook|live|gmail).com(.ar)?/,
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255],
    }
  }
}, {
  // Options
  sequelize,
  tableName: "Users"
});

export default User;