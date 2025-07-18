import type { Express, Request, Response } from "express";
import { getTipos } from "./controllers/tipo.controller";
import { getPropiedad } from "./controllers/propiedad.controller";
import { getFabricante } from "./controllers/fabricante.controller";
import {
  getDispositivo,
  getDispositivos,
} from "./controllers/dispositivo.controller";

function routes(app: Express) {
  app.get("/healthcheck", function (_: Request, res: Response) {
    res.sendStatus(200);
  });
  //   RUTAS DE ACCESO AL TIPO DE DISPOSITIVO
  app.get("/api/tipo", getTipos);
  //   RUTAS DE ACCESO A LAS PROPIEDADES DEL TIPO
  app.get("/api/propi", getPropiedad);
  //   RUTAS DE ACCESO A LOS FABRICANTES
  app.get("/api/fabricante", getFabricante);
  //   RUTAS DE ACCESO A LOS DISPOSITIVOS
  app.get("/api/dispo", getDispositivos);
  app.get("/api/dispo/:id", getDispositivo);
}
export default routes;
