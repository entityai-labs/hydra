const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const ShopManager = require("./ShopManager");

class Shop {
  thumbnail;
  shopManager;

  constructor() {
    this.shopManager = new ShopManager();
  }

  /**
   *
   * @param {String} category
   * @returns {EmbedBuilder}
   */
  sendCategoryEmbed(category, user) {
    const categoryName = this.shopManager.getCategoryName(category);
    const embed = new EmbedBuilder()
      .setThumbnail(this.getCategoryThumbnail())
      .setColor("#2B2D31")
      .setAuthor({
        name: `Minecoins Shop | <:1060272407471984710:1316553624075108372> ${user.minecoins}`,
        iconURL: "https://cdn.discordapp.com/emojis/708761048500535406.gif",
      })
      .setFooter({
        text: `Você está visualizando a categoria: ${categoryName}`,
      });

    return embed;
  }

  /**
   *
   * @param {String} category
   * @returns {ActionRowBuilder}
   */
  sendItemSelector(category) {
    const itemsByCategory = this.shopManager.itemsByCategory(category);

    const select = new StringSelectMenuBuilder()
      .setCustomId(category)
      .setPlaceholder("Escolha um item")
      .addOptions(
        itemsByCategory.map((item) =>
          new StringSelectMenuOptionBuilder()
            .setValue(item.id)
            .setEmoji("1316553624075108372")
            .setLabel(`${item.name} - ${item.price}`)
        )
      );

    const row = new ActionRowBuilder().addComponents(select);
    return row;
  }

  /**
   *
   * @param {String} category
   */
  setCategoryThumbnail(category) {
    switch (category) {
      case "tools":
        this.thumbnail =
          "https://cdn.discordapp.com/emojis/1315104604706443355.webp?size=44";
        break;
      default:
        break;
    }
  }

  /**
   *
   * @returns {String}
   */
  getCategoryThumbnail() {
    return this.thumbnail;
  }
}

module.exports = Shop;
