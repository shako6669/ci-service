import type { Express, Request, Response } from "express";
import { getTipos } from "./controllers/tipo.controller";
import {
  getPropiedad,
  postPropiedad,
} from "./controllers/propiedad.controller";
import { getFabricante } from "./controllers/fabricante.controller";
import {
  getDispositivo,
  getDispositivos,
} from "./controllers/dispositivo.controller";
import {
  getCategorias,
  saveCategoria,
} from "./controllers/categoria.controller";

function routes(app: Express) {
  app.get("/healthcheck", function (_: Request, res: Response) {
    res.sendStatus(200);
  });
  //   RUTAS DE ACCESO AL TIPO DE DISPOSITIVO
  app.get("/api/tipo", getTipos);
  //   RUTAS DE ACCESO A LAS PROPIEDADES DEL TIPO
  app.get("/api/propi", getPropiedad);
  app.post("/api/propi", postPropiedad);
  //   RUTAS DE ACCESO A LOS FABRICANTES
  app.get("/api/fabricante", getFabricante);
  //   RUTAS DE ACCESO A LOS DISPOSITIVOS
  app.get("/api/dispo", getDispositivos);
  app.get("/api/dispo/:id", getDispositivo);
  // RUTAS DE ACCESO A LAS CATEGORIAS
  app.get("/api/categoria", getCategorias);
  app.post("/api/categoria", saveCategoria);
}
export default routes;
