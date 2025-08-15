import { Sequelize } from "sequelize";
import logger from "../utils/logger";

const db = new Sequelize(
  process.env.BASE_DATOS || "sop_bodega",
  "root",
  "123",
  {
    host: process.env.HOST,
    dialect: "mysql",
    logging:
      process.env.BASE_DATOS === "soporte"
        ? true
        : (msg, timing) => {
            // Only log if the message contains an error
            if (msg.includes("ERROR") || msg.toLowerCase().includes("error")) {
              console.error(msg);
              if (timing) console.error(`Execution time: ${timing}ms`);
            }
          },
  }
);

// db.sync({ force: true });
db.sync({ alter: true, logging: console.log });
// db.sync();

export default db;
