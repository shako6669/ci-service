import { Request, Response } from "express";
import logger from "../utils/logger";
import Dispositivo from "../model/dispositivo.model";
import Propiedad from "../model/propiedad.model";
import { Op, Transaction } from "sequelize";
import Tipo from "../model/tipo.model";
import Fabricante from "../model/fabricante.model";
import Categoria from "../model/categoria.model";
import db from "../db/connection";
import { version } from "pino";
import Detalle from "../model/detalle.model";

interface IDispo {
  id: number;
  serie: string;
  cod_inventario: string;
  estado: "REGISTRADO" | "EN_BODEGA" | "ASIGNADO" | "REPUESTO" | "BAJA";
  activo: boolean;
  propi_dispo: IPropiedad[];
}
interface IDetalle {
  valor: string;
  version: string;
  DispositivoId: number;
  PropiedadId: number;
}
interface IPropiedad {
  id: number;
  nombre: string;
  descripcion: string;
  auto_suma: boolean;
  Detalle: IDetalle;
}

interface IDtoDispo {
  id: number;
  serie: string;
  codInventario: string;
  estado: string;
  activo: boolean;
  marca: string;
  modelo: string;
  tipo: string;
  propiedades: Record<string, string>;
  componentes: Record<string, string | number>;
}

interface ISaveDispo {
  id: number;
  codInventario: string;
  serie: string;
  marcaId: number;
  modeloId: number;
  tipoId: number;
  detallePropi: {
    idPropiedad: number;
    valor: string;
    version: string;
  }[];
  componentes: ISaveDispo[];
}

export const getDispositivos = async (req: Request, res: Response) => {
  try {
    const dispoDTO: IDtoDispo[] = [];
    const dispositivo = await Dispositivo.findAll({
      where: {
        idPadre: { [Op.is]: null },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: Fabricante,
          as: "marca",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Fabricante,
          as: "modelo",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Tipo,
          as: "tipo",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Propiedad,
          as: "propi_dispo",
          attributes: {
            include: ["id", "nombre", "descripcion", "auto_suma"],
            exclude: [
              "createdAt",
              "updatedAt",
              "clasificado",
              "versionado",
              "catId",
            ],
          },
          through: {
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        },
        {
          model: Dispositivo,
          as: "componentes",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Fabricante,
              as: "marca",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: Fabricante,
              as: "modelo",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: Tipo,
              as: "tipo",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: Propiedad,
              as: "propi_dispo",
              attributes: {
                include: ["id", "nombre", "descripcion", "auto_suma"],
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "clasificado",
                  "versionado",
                  "catId",
                ],
              },
              through: {
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            },
          ],
        },
      ],
    });

    const promiseArray = dispositivo.map(async (dis) => {
      // Buscar las propiedades activas del tipo de dispositivo
      const propiTipo = await Propiedad.findAll({
        include: {
          model: Tipo,
          as: "tipos",
          where: { id: dis.getDataValue("tipoId") },
        },
      });
      //Creamos el objeto inicial para las propiedades de cada dispositivos por su tipo
      const tipoPropiedades = Object.fromEntries(
        propiTipo.map((prop) => [prop.getDataValue("nombre"), ""])
      ) as Record<string, string>;
      //Obtenemos las propiedades de cada dispositivo
      const propiedades = dis.getDataValue("propi_dispo") as IPropiedad[];
      //Recorremos cada propiedad para ir llenando los valores de cada propiedad
      const propObject = propiedades.reduce(
        (prev: Record<string, string>, cur: IPropiedad) => {
          if (propiTipo.some((i) => i.getDataValue("id") === cur.id)) {
            return { ...prev, [cur.nombre]: cur.Detalle.valor };
          } else return { ...prev };
        },
        tipoPropiedades
      );
      const componentes = dis.getDataValue("componentes") as IDispo[];
      // Recorremos el arreglo de los componentes para calcular el objeto
      const compObject = componentes.reduce(
        (prev: Record<string, number | string>, cur: IDispo) => {
          const keys = Object.keys(prev);
          // Recorremos el arreglo de las propiedades de un componente
          const propObject = cur.propi_dispo.reduce(
            (pre: Record<string, number | string>, cu: IPropiedad) => {
              if (cu.auto_suma) {
                // console.log(
                //   "PROPIEDAD ",
                //   cu.nombre,
                //   " Valor ",
                //   cu.Detalle.valor
                // );
                if (keys.some((k) => k === cu.nombre)) {
                  const prevData = prev[cu.nombre];
                  return {
                    ...prev,
                    [cu.nombre]:
                      parseInt(prevData as string) + parseInt(cu.Detalle.valor),
                  };
                } else {
                  return {
                    ...prev,
                    [cu.nombre]: cu.Detalle.valor,
                  };
                }
              } else {
                return { ...prev };
              }
            },
            {}
          );
          // Fin del recorrido de las propiedades
          // Devolvemos el objecto calculado de los componentes
          return { ...prev, ...propObject };
        },
        {}
      );
      // Fin del recorrido de los componentes
      dispoDTO.push({
        id: dis.getDataValue("id"),
        serie: dis.getDataValue("serie"),
        marca: dis.getDataValue("marca").getDataValue("nombre"),
        modelo: dis.getDataValue("modelo").getDataValue("nombre"),
        tipo: dis.getDataValue("tipo").getDataValue("nombre"),
        activo: dis.getDataValue("activo"),
        codInventario: dis.getDataValue("codInventario"),
        estado: dis.getDataValue("estado"),
        propiedades: { ...propObject },
        componentes: { ...compObject },
      });
    });

    await Promise.all(promiseArray);
    res.status(200).json(dispoDTO);
  } catch (error) {
    logger.info("Ocurrió un error");
  }
};

export const getDispositivo = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const dispositivo = await Dispositivo.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: Fabricante,
          as: "marca",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Fabricante,
          as: "modelo",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Tipo,
          as: "tipo",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Propiedad,
          as: "propi_dispo",
          attributes: {
            include: ["id", "nombre", "descripcion", "auto_suma"],
            exclude: [
              "createdAt",
              "updatedAt",
              "clasificado",
              "versionado",
              "catId",
            ],
          },
          include: ["categoria"],
          through: {
            attributes: {
              exclude: ["createdAt", "updatedAt"],
            },
          },
        },
        {
          model: Dispositivo,
          as: "componentes",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: Fabricante,
              as: "marca",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: Fabricante,
              as: "modelo",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: Tipo,
              as: "tipo",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: Propiedad,
              as: "propi_dispo",
              attributes: {
                include: ["id", "nombre", "descripcion", "auto_suma"],
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "clasificado",
                  "versionado",
                  "catId",
                ],
              },
              through: {
                attributes: {
                  exclude: ["createdAt", "updatedAt"],
                },
              },
            },
          ],
        },
      ],
    });

    res.status(200).json(dispositivo);
  } catch (error) {
    logger.info("Ocurrio un error");
  }
};

export const saveDispositivo = async (
  req: Request<{}, {}, ISaveDispo[], {}>,
  res: Response
) => {
  const { body } = req;

  const transaction = await db.transaction({
    autocommit: false,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });
  try {
    for (const element of body) {
      const newDispo = await Dispositivo.build();
      newDispo.setDataValue("serie", element.serie);
      if (element.codInventario !== "") {
        newDispo.setDataValue("codInventario", element.codInventario);
      }
      newDispo.setDataValue("marcaId", element.marcaId);
      newDispo.setDataValue("modeloId", element.modeloId);
      newDispo.setDataValue("tipoId", element.tipoId);

      await newDispo.save({
        transaction,
      });

      for (const detalle of element.detallePropi) {
        //@ts-ignore
        await newDispo.addPropi_dispo(detalle.idPropiedad, {
          transaction,
          through: {
            valor: detalle.valor,
            version: detalle.version,
          },
        });
      }
      for (const componente of element.componentes) {
        const newComp = await Dispositivo.build();
        componente.serie !== "" &&
          newComp.setDataValue("serie", componente.serie);
        componente.marcaId > 0 &&
          newComp.setDataValue("marcaId", componente.marcaId);
        componente.modeloId > 0 &&
          newComp.setDataValue("modeloId", componente.modeloId);
        newComp.setDataValue("tipoId", componente.tipoId);

        await newComp.save({
          transaction,
        });

        for (const detalleComp of componente.detallePropi) {
          //@ts-ignore
          await newComp.addPropi_dispo(detalleComp.idPropiedad, {
            transaction,
            through: {
              valor: detalleComp.valor,
              version: detalleComp.version,
            },
          });

          //@ts-ignore
          await newDispo.addComponentes(newComp, { transaction });
        }
      }
    }
    await transaction.commit();
    res.status(200).json({ message: "Registro exitoso" });
  } catch (error) {
    await transaction.rollback();
    logger.error("Ocurrió un error");
    logger.error(error);
    res.status(500).json(error);
  }
};
