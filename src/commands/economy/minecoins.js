const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minecoins")
    .setDescription("Gerenciar Minecoins")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("give")
        .setDescription("Enviar Minecoins para um usuário")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("O usuário que irá receber os Minecoins")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Quantidade para enviar")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remover Minecoins de um usuário")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("O usuário para remover os Minecoins")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Quantidade para remover")
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    
  },
};
