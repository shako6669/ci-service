import { DataTypes } from "sequelize";
import db from "../db/connection";
import Clasificacion from "./clasificacion.model";
import Categoria from "./categoria.model";

const Propiedad = db.define(
  "Propiedad",
  {
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    clasificado: DataTypes.BOOLEAN,
    auto_suma: DataTypes.BOOLEAN,
    versionado: DataTypes.BOOLEAN,
  },
  {
    freezeTableName: true,
    tableName: "inv_propiedad",
  }
);

Propiedad.hasMany(Clasificacion, {
  as: "clasificacion",
  foreignKey: "propiId",
  sourceKey: "id",
});

Propiedad.belongsTo(Categoria, {
  as: "categoria",
  foreignKey: "catId",
  targetKey: "id",
});

export default Propiedad;
