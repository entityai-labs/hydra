const { SlashCommandBuilder, Interaction } = require("discord.js");
const User = require("../../models/User");

const minecoinsPerDay = 5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Resgate seus Minecoins diariamente"),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: `O comando **${interaction.commandName}** só pode ser executado dentro de uma guilda.`,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const user = await User.findOne({
        discordId: interaction.user.id
      });

      if (!user) {
        interaction.editReply(
          `Registre-se antes de resgatar sua recompensa diária.`
        );
        return;
      }

      const lastDailyDate = user.dailyLastUsed.toDateString();
      const currentDate = new Date().toDateString();

      const alreadyCollected = lastDailyDate === currentDate;

      if (alreadyCollected) {
        interaction.editReply(
          "Você já coletou sua recompensa diária. Tente novamente mais tarde."
        );
        return;
      }

      user.dailyLastUsed = new Date();
      user.minecoins += minecoinsPerDay;
      await user.save();

      interaction.editReply("Sucesso!");
    } catch (error) {
      console.log(error);
    }
  },
};
