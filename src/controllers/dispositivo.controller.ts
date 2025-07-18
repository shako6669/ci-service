import { Request, Response } from "express";
import logger from "../utils/logger";
import Dispositivo from "../model/dispositivo.model";
import Propiedad from "../model/propiedad.model";
import { Op } from "sequelize";
import Tipo from "../model/tipo.model";
import Fabricante from "../model/fabricante.model";

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

export const getDispositivos = async (req: Request, res: Response) => {
  try {
    const dispoDTO: Record<string, string>[] = [];
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

    dispositivo.map((dis) => {
      const propiedades = dis.getDataValue("propi_dispo") as IPropiedad[];
      const propObject = propiedades.reduce(
        (prev: Record<string, string>, cur: IPropiedad) => {
          return { ...prev, [cur.nombre]: cur.Detalle.valor };
        },
        {}
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
        ...propObject,
        ...compObject,
      });
    });
    res.status(200).json(dispoDTO);
  } catch (error) {
    logger.info("Ocurrio un error");
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
