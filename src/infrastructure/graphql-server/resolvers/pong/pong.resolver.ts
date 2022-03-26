import { pongController } from "../../../../application/controllers";
import { iResolver } from "../../interfaces";

const pingResolver: iResolver<void> = async (...[, args, context]) => {
  return await pongController(args, context);
};

module.exports = {
  Query: {
    ping: pingResolver,
  },
};
