import { DataTypes } from "sequelize";
import db from "../db/connection";
import logger from "../utils/logger";
import Propiedad from "./propiedad.model";

logger.info("Log de modelo TIPO");

const Tipo = db.define(
  "Tipo",
  {
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    activo: DataTypes.BOOLEAN,
    esRepuesto: DataTypes.BOOLEAN,
  },
  {
    freezeTableName: true,
    tableName: "inv_tipo",
  }
);

Tipo.belongsToMany(Tipo, {
  as: "tiposRelacionado",
  through: "inv_tipo_compuesto",
  foreignKey: "tipoId",
  otherKey: "tipoRelacionadoId",
});
Tipo.belongsToMany(Tipo, {
  as: "tipoRelacionado",
  through: "inv_tipo_compuesto",
  foreignKey: "tipoRelacionadoId",
  otherKey: "tipoId",
});

Tipo.belongsToMany(Propiedad, {
  through: "inv_prop_tipo",
  as: "propiedades",
});

Propiedad.belongsToMany(Tipo, {
  through: "inv_prop_tipo",
  as: "tipos",
});

export default Tipo;
