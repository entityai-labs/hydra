const { SlashCommandBuilder, Interaction } = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Ver seu saldo ou de outro membro")
    .addUserOption((option) =>
      option.setName("user").setDescription("O usuário para ver o saldo")
    ),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const userOption = interaction.options.getUser("user");
    const user = userOption || interaction.user;

    try {
      await interaction.deferReply();

      let storedUser = await User.findOne({
        discordId: user.id,
      });

      if (!storedUser) {
        interaction.editReply({
          content: `Esse usuário ainda não foi registrado.`,
        });
        return;
      }

      interaction.editReply(
        `Saldo de ${user.username}: **${storedUser.minecoins} Minecoins**`
      );
    } catch (error) {
      console.log(error);
    }
  },
};
