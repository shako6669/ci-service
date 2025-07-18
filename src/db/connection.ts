import { Sequelize } from "sequelize";
import logger from "../utils/logger";

const db = new Sequelize(
  process.env.BASE_DATOS || "sop_bodega",
  "root",
  "123",
  {
    host: process.env.HOST,
    dialect: "mysql",
    logging: (msg) => {
      // Only log if the message contains an error
      if (msg.includes("ERROR") || msg.includes("error")) {
        logger.debug(msg);
      }
    },
  }
);

// db.sync({ force: true });
db.sync({ alter: true, logging: console.log });
// db.sync();

export default db;
