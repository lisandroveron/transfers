import {DataTypes, Model} from "sequelize";
import sequelize from "../config.js";

class Transfer extends Model {};

Transfer.init({
  // Attributes
  reference: {
    type: DataTypes.STRING(64),
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  // Options
  sequelize,
  tableName: "Transfers"
});

export default Transfer;