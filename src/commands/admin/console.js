const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");
const sendCommand = require("../../utils/sendCommand");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("console")
    .setDescription("Enviar comando para o servidor")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("O comando que será executado")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const command = interaction.options.getString("command");

    const result = await sendCommand(command);

    console.log(result);

    interaction.reply(
      `Comando **/${command}** executado com sucesso no console do servidor.`
    );
  },
};
