import { DataTypes } from "sequelize";
import db from "../db/connection";
import Propiedad from "./propiedad.model";
import Detalle from "./detalle.model";
import Tipo from "./tipo.model";
import Fabricante from "./fabricante.model";

const Dispositivo = db.define(
  "Dispositivo",
  {
    serie: DataTypes.STRING,
    codInventario: DataTypes.STRING,
    estado: DataTypes.ENUM(
      "REGISTRADO",
      "EN_BODEGA",
      "ASIGNADO",
      "REPUESTO",
      "BAJA"
    ),
    activo: DataTypes.BOOLEAN,
  },
  {
    freezeTableName: true,
    tableName: "inv_dispositivo",
    indexes: [
      {
        unique: true,
        fields: ["serie"],
      },
      {
        unique: true,
        fields: ["codInventario"],
      },
    ],
  }
);

Dispositivo.belongsToMany(Propiedad, {
  through: { model: Detalle },
  as: "propi_dispo",
});

Dispositivo.hasMany(Dispositivo, {
  foreignKey: "idPadre",
  as: "componentes",
  sourceKey: "id",
});

Dispositivo.belongsTo(Tipo, {
  as: "tipo",
  foreignKey: "tipoId",
  targetKey: "id",
});
Dispositivo.belongsTo(Fabricante, {
  as: "marca",
  foreignKey: "marcaId",
  targetKey: "id",
});
Dispositivo.belongsTo(Fabricante, {
  as: "modelo",
  foreignKey: "modeloId",
  targetKey: "id",
});

export default Dispositivo;
