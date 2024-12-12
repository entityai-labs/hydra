const { items, categories } = require("../shop-config");

class ShopManager {
  /**
   *
   * @param {String} category
   */
  itemsByCategory(category) {
    const categoryItem = items.filter((item) => item.category === category);

    return categoryItem;
  }

  /**
   *
   * @param {Number} id
   */
  getItemById(id) {
    const itemId = items.find((item) => item.id === id);
    return itemId;
  }

  /**
   *
   * @param {String} value
   */
  getCategoryName(value) {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.label : null;
  }
}

module.exports = ShopManager;
