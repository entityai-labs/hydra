const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Clear any text channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Message amount")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount > 100) {
      return interaction.reply({
        ephemeral: true,
        content: `Invalid quantity '${amount}', it must be less than 100.`,
      });
    }

    await interaction.deferReply();

    try {
      const messages = await interaction.channel.bulkDelete(amount - 1, true);

      interaction.followUp({
        content: `Successfully deleted ${messages.size} messages.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      interaction.followUp({
        content: `An error occurred while trying to delete messages.`,
        ephemeral: true,
      });
    }
  },
};
