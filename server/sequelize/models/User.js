import {randomBytes} from "crypto";
import {DataTypes, Model} from "sequelize";
import sequelize from "../config.js";
import {saltPassword} from "../../utils.js";

class User extends Model {
  authenticate(password) {
    const [saltedPassword] = saltPassword(password, this.salt);
    return this.password === saltedPassword;
  };

  createSessionId() {
    const id = randomBytes(32).toString("hex");
    this.setDataValue("sessionId", id);
    this.save();
    return id;
  };

  getAccountInfo() {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      phone: this.phone
    };
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
  phone: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      is: /\d+/
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
      const [saltedPassword, salt] = saltPassword(password);
      this.setDataValue("salt", salt);
      this.setDataValue("password", saltedPassword);
    }
  },
  sessionId: {
    type: DataTypes.STRING(64),
  }
}, {
  // Options
  sequelize,
  tableName: "Users"
});

export default User;