import { Request, Response } from "express";
import logger from "../utils/logger";
import Fabricante from "../model/fabricante.model";

export const getFabricante = async (req: Request, res: Response) => {
  try {
    const fabricantes = await Fabricante.findAll({
      include: "modelos",
    });
    res.status(200).json(fabricantes);
  } catch (error) {
    logger.info(error);
  }
};
