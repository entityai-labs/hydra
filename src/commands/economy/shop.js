const {
  SlashCommandBuilder,
  Interaction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const User = require("../../models/User");
const Shop = require("../../classes/Shop");
const { categories } = require("../../shop-config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Adquira itens, prefixos e muito mais!"),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const user = await User.findOne({
      discordId: interaction.user.id,
    });

    const embed = new EmbedBuilder()
      .setThumbnail(
        "https://cdn.discordapp.com/emojis/1060272407471984710.webp?size=44"
      )
      .setTitle("Seu saldo atual:")
      .setDescription(
        `<:minecoins:1315100445500375050> ${user.minecoins} Minecoins\n\n> **Escolha uma categoria abaixo:**`
      )
      .setAuthor({
        name: "Minecoins Shop",
        iconURL: "https://cdn.discordapp.com/emojis/708761048500535406.gif",
      })
      .addFields(
        {
          name: "<:736225653355184158:1315095318647406694> Ferramentas",
          value: `<:diamond_sword:1315104604706443355> Espadas & Picaretas`,
          inline: false,
        },
        {
          name: "<:736225653371830293:1315095312108355614> Poções",
          value: `<:potion:1316521991263748176> Poções de regeneração, dano`,
          inline: false,
        },
        {
          name: "<:736225653355184158:1315095318647406694> Armaduras",
          value: `<:netherite_chestplate:1316507127904469062> Full sets encantados`,
          inline: false,
        },
        {
          name: "<:736225653355184158:1315095318647406694> Tags",
          value: `<:name_tag:1316507142450184292> Prefixos personalizados`,
          inline: false,
        },
        {
          name: "<:736225653355184158:1315095318647406694> Passes",
          value: `<:nether_star:1316507136347344987> Passes minigames`,
          inline: false,
        }
      )
      .setColor("#2B2D31");

    const select = new StringSelectMenuBuilder()
      .setCustomId("category")
      .setPlaceholder("Escolha uma categoria")
      .addOptions(
        categories.map((cat) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.label)
            .setValue(cat.value)
            .setEmoji(cat.emoji)
        )
      );

    const row = new ActionRowBuilder().addComponents(select);

    interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) =>
        i.customId === "category" && i.user.id === interaction.user.id,
      time: 60000,
    });

    const shop = new Shop();

    collector.on("collect", async (i) => {
      const selectedValue = i.values[0];

      await i.deferReply();

      switch (selectedValue) {
        case "tools":
          shop.setCategoryThumbnail("tools");
          i.editReply({
            embeds: [shop.sendCategoryEmbed("tools", user)],
            components: [shop.sendItemSelector("tools")]
          });
          break;
        case "potions":
          shop.setCategoryThumbnail("potions");
          i.editReply({
            embeds: [shop.sendCategoryEmbed("potions", user)],
            components: [shop.sendItemSelector("potions")]
          });
          break;
        case "armor":
          shop.setCategoryThumbnail("armor");
          i.editReply({
            embeds: [shop.sendCategoryEmbed("armor", user)],
            components: [shop.sendItemSelector("armor")]
          });
          break;
        case "tags":
          shop.setCategoryThumbnail("tags");
          i.editReply({
            embeds: [shop.sendCategoryEmbed("tags", user)],
            components: [shop.sendItemSelector("tags")]
          });
          break;
        case "passes":
          shop.setCategoryThumbnail("passes");
          i.editReply({
            embeds: [shop.sendCategoryEmbed("passes", user)],
            components: [shop.sendItemSelector("passes")]
          });
          break;
        default:
          break;
      }
    });
  },
};
