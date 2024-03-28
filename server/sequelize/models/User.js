import {randomBytes} from "crypto";
import {DataTypes, Model} from "sequelize";
import sequelize from "../config.js";
import {encryptPassword} from "../../utils.js";

class User extends Model {
  authenticate(password) {
    const [encryptedPassword] = encryptPassword(password, this.salt);
    return this.password === encryptedPassword;
  };
};

User.init({
  // Attributes
  firstname: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: [2, 64],
      is: /[a-zA-ZáéíóúÁÉÍÓÚñ ]+/
    }
  },
  lastname: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: {
      len: [2, 64],
      is: /[a-zA-ZáéíóúÁÉÍÓÚñ ]+/
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
  salt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255],
    },
    set(password) {
      const [encryptedPassword, salt] = encryptPassword(password);
      this.setDataValue("salt", salt);
      this.setDataValue("password", encryptedPassword);
    }
  }
}, {
  // Options
  sequelize,
  tableName: "Users"
});

export default User;