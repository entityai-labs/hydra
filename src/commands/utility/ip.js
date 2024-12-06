const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ip")
    .setDescription("Mostrar IP do servidor MC"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setFooter({
        text: `Request by ${interaction.user.globalName}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor("#2B2D31")
      .setDescription(
        `
      <:minecraftlogopng2:1310356302811238482> **Java Edition:** \`play.hydra-mc.xyz\`
      <:minecraftlogopng2:1310356302811238482> **Bedrock Edition:** \`bedrock.hydra-mc.xyz\`
  
      <:Minecraft:1310371998664232960> **Porta Padrão:** \`25976\`
      `
      );

    interaction.reply({ embeds: [embed] });
  },
};
