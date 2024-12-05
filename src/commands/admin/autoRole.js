const {
  SlashCommandBuilder,
  Interaction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Welcome = require("../../models/Welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole-setup")
    .setDescription("Configure o cargo automático no servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) => option.setName("role").setRequired(true)),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const role = interaction.options.getRole("role");

    try {
      const welcome = await Welcome.findOne({ guildId: interaction.guild.id });
      if (!welcome) {
        console.error(`Welcome data does not exists`);
        return;
      }

      welcome.roleId = role.id;
      await welcome.save();

      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setDescription("Auto-role configurado e salvo.");

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
};
