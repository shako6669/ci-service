import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import config from "config";
import logger from "./utils/logger";
import routes from "./routes";
import db from "./db/connection";

require("dotenv").config();

const port = config.get<number>("port");
const app = express();

async function dbConnection() {
  try {
    await db.authenticate();
    const modelNames = Object.keys(db.models);
    logger.info(`Modelos: ${modelNames}`);
    logger.info("database is online");
  } catch (error: any) {
    throw new Error(error);
  }
}

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(port, () => {
  dbConnection();
  logger.info(`Server running on http://${process.env.HOST}:${port}`);
  routes(app);
});
