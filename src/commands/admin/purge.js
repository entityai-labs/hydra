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
        .setMinValue(1)
        .setMaxValue(10)
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

    try {
      const messages = await interaction.channel.messages.fetch({
        limit: amount,
      });

      await interaction.channel.bulkDelete(messages, true);

      return interaction.reply({
        content: `${amount} mensagens foram apagadas.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
