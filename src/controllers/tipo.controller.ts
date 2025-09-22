import type { Request, Response } from "express";
import Tipo from "../model/tipo.model";
import logger from "../utils/logger";
import Propiedad from "../model/propiedad.model";
import Clasificacion from "../model/clasificacion.model";
import Categoria from "../model/categoria.model";
import db from "../db/connection";
import { Transaction } from "sequelize";

export const getTipos = async (req: Request, res: Response) => {
  try {
    const tipo = await Tipo.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: Tipo,
          as: "tiposRelacionado",
          attributes: {
            include: ["id", "nombre", "descripcion", "activo", "esRepuesto"],
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Propiedad,
          as: "propiedades",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
            include: [
              "id",
              "nombre",
              "descripcion",
              "clasificado",
              "auto_suma",
              "versionado",
            ],
          },
          include: [
            {
              model: Clasificacion,
              as: "clasificacion",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: Categoria,
              as: "categoria",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
          ],
        },
      ],
    });
    res.status(200).json(tipo);
  } catch (error) {
    logger.info(error);
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

export const saveTipo = async( req: Request, res: Response,)=>{
  const {body} = req
  const transaction = await db.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    autocommit: false
  })
  try {
    console.log(body)
    const newTipo = await Tipo.create(body, {transaction})
    //@ts-ignore
    await newTipo.AddPropiedades(body.propiedades, { transaction})
    await newTipo.save({transaction})
    await transaction.commit()
    res.status(200).json({msj: "Registro guardado correctamente"})
  } catch (error) {
    logger.info(error);
    await transaction.rollback()
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
}
