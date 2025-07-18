import { DataTypes } from "sequelize";
import db from "../db/connection";

const Categoria = db.define(
  "Categoria",
  {
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
  },
  { freezeTableName: true, tableName: "inv_categoria" }
);

export default Categoria;
