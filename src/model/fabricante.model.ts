import { DataTypes } from "sequelize";
import db from "../db/connection";

const Fabricante = db.define(
  "Fabricante",
  {
    nombre: DataTypes.STRING,
    tipo: DataTypes.ENUM("marca", "modelo"),
  },
  { freezeTableName: true, tableName: "inv_fabricante" }
);

Fabricante.hasMany(Fabricante, {
  foreignKey: "idPadre",
  as: "modelos",
  sourceKey: "id",
});

export default Fabricante;
