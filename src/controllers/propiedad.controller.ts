import { Request, Response } from "express";
import Propiedad from "../model/propiedad.model";
import logger from "../utils/logger";
import db from "../db/connection";
import { Transaction } from "sequelize";
import Categoria from "../model/categoria.model";

export const getPropiedad = async (req: Request, res: Response) => {
  try {
    const propiedades = await Propiedad.findAll({
      include: ["categoria"]
    });
    res.status(200).json(propiedades);
  } catch (error) {
    logger.info(error);
  }
};

export const postPropiedad = async (req: Request, res: Response) => {
  const { body } = req;
  const transaction = await db.transaction({
    autocommit: false,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });
  try {
    const categoria = await Categoria.findByPk(body.categoria.id, {
      transaction,
    });
    const propiedad = await Propiedad.create(
      { ...body, catId: body.categoria.id },
      {
        transaction,
        include: ["clasificacion"],
      }
    );
    // @ts-ignore
    // await categoria.addPropiedad(propiedad, { transaction });
    await propiedad.save();
    await transaction.commit();
    res.status(200).json({ msj: "Registro exitoso" });
  } catch (error) {
    logger.error(error);
    await transaction.rollback();
    res.status(500).json({ msj: "Ocurrió un error" });
  }
};
