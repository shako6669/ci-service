import logger, { levels } from "pino";
import dayjs from "dayjs";
const log = logger({
  transport: {
    target: "pino-pretty",
    options: {
      levelFirst: true,
      translateTime: true,
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timestamp() {
    return `, "time": "${dayjs().format("DD-MM-YYYYTHH:mm")}"`;
  },
});
export default log;
