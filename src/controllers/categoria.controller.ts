import { Request, Response } from "express";
import Categoria from "../model/categoria.model";
import logger from "../utils/logger";
import db from "../db/connection";
import { Transaction } from "sequelize";

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await Categoria.findAll();
    res.status(200).json(categorias);
  } catch (error) {
    logger.info(error);
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};
export const saveCategoria = async (req: Request, res: Response) => {
  const { body } = req;
  const transaction = await db.transaction({
    autocommit: false,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });
  try {
    const categoria = await Categoria.create(body, { transaction });
    categoria.save();
    await transaction.commit();
    res.status(200).json(categoria);
  } catch (error) {
    logger.info(error);
    await transaction.rollback();
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};
export const test = (req: Request, res: Response) => {
  const { body } = req;
  try {
    throw new Error();
    res.status(200).json();
  } catch (error) {
    logger.info(error);
    res.status(500).json({ message: "Error", data: [], reqStatus: false });
  }
};
