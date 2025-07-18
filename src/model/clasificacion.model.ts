import { DataTypes } from "sequelize";
import db from "../db/connection";

const Clasificacion = db.define(
  "Clasificacion",
  {
    nombre: DataTypes.STRING,
  },
  { freezeTableName: true, tableName: "inv_clasificacion" }
);

export default Clasificacion;
