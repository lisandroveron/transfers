import {DataTypes, Model} from "sequelize";
import sequelize from "../config.js";
import {createHash, randomBytes} from "crypto";

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
  salt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255],
    },
    set(password) {
      const hash = createHash("sha256");
      hash.update(password + this.salt);
      this.setDataValue("password", hash.digest("hex"));
    }
  }
}, {
  // Options
  sequelize,
  tableName: "Users"
});

User.beforeCreate(async (user, options) => {
  user.salt = randomBytes(16).toString("hex");
});

export default User;