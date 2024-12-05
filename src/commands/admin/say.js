const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Enviar mensagem para o servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Enviar mensagem para o servidor")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Canal para enviar a mensagem")
        .setRequired(false)
    ),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const message = interaction.options.getString("message");

    await channel.send(message);
    interaction.reply({ content: "Sucesso.", ephemeral: true });
  },
};
