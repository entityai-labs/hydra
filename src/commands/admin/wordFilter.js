const {
  SlashCommandBuilder,
  Interaction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const WordFilter = require("../../models/WordFilter");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wordfilter-add")
    .setDescription("Restringir palavra no servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => option.setName("word").setRequired(true)),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const word = interaction.options.getString("word");

    try {
      await WordFilter.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $addToSet: { words: { word } } },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setDescription(
          `<:Minecraft:1310372150586249237> A palavra **${word}** foi inserida com sucesso no banco de dados.`
        );
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
};
