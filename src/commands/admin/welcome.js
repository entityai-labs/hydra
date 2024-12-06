const {
  SlashCommandBuilder,
  Interaction,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Welcome = require("../../models/Welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome-setup")
    .setDescription("Configurar boas-vindas")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) => option.setName("channel").setDescription("Canal de boas-vindas").setRequired(true)),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const channelId = interaction.options.get("channel").value;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "Precisa ser um canal de texto válido.",
        ephemeral: true,
      });
    }

    try {
      await Welcome.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { guildId: interaction.guild.id, welcomeChannel: channel.id },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setDescription("Canal de boas-vindas configurado e salvo.");

      interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
