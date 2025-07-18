import { Request, Response } from "express";
import Propiedad from "../model/propiedad.model";
import logger from "../utils/logger";

export const getPropiedad = async (req: Request, res: Response) => {
  try {
    const propiedades = await Propiedad.findAll();
    res.status(200).json(propiedades);
  } catch (error) {
    logger.info(error);
  }
};
