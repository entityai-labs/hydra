const { Rcon } = require("rcon-client");

/**
 *
 * @param {String} command
 */
module.exports = async (command) => {
  try {
    const rcon = await Rcon.connect({
      host: process.env.RCON_HOST,
      port: process.env.RCON_PORT,
      password: process.env.RCON_PASSWORD,
    });

    const start = Date.now();

    let output = await rcon.send(command);
    output = output.replace(/§[0-9a-fk-orA-FK-OR]/g, "");

    const elapsed = Date.now() - start;

    rcon.end();

    return {
      output,
      elapsed: `${elapsed}ms`,
    }
  } catch (error) {
    console.log(`Error on RCON Client: ${error}`);
  }
};
