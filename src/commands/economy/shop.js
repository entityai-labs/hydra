const {
  SlashCommandBuilder,
  Interaction,
  EmbedBuilder,
} = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Adquira itens, prefixos e mais!"),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const user = await User.findOne({
        discordId: interaction.user.id
    });

    const embed = new EmbedBuilder()
      .setThumbnail("https://i.imgur.com/ItTLo9k.png")
      .setTitle("Seu saldo atual:")
      .setDescription(
        `<:minecoins:1315100445500375050> ${user.minecoins} Minecoins\n\n> **Escolha uma categoria abaixo:**`
      )
      .setAuthor({
        name: "Minecoins Shop",
        iconURL: "https://cdn.discordapp.com/emojis/708761048500535406.gif",
      })
      .addFields({
        name: "<:736225653355184158:1315095318647406694> Ferramentas",
        value: `<:diamond_sword:1315104604706443355> Espadas & Picaretas`,
        inline: true,
      })
      .setColor("#2B2D31");

    interaction.reply({ embeds: [embed] });
  },
};
