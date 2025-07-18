import { DataTypes } from "sequelize";
import db from "../db/connection";

const Detalle = db.define(
  "Detalle",
  {
    valor: DataTypes.STRING,
    version: DataTypes.STRING,
  },
  { freezeTableName: true, tableName: "inv_detalle" }
);

export default Detalle;
