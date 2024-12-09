const { Events, Message, EmbedBuilder } = require("discord.js");
const WordFilter = require("../models/WordFilter");

module.exports = {
  name: Events.MessageCreate,
  once: false,

  /**
   *
   * @param {Message} message
   */
  async execute(message) {
    if (message.author.bot || !message.inGuild()) return;

    try {
      const wordFilter = await WordFilter.findOne({
        guildId: message.guild.id,
      });
      if (!wordFilter || wordFilter.words.length === 0) return;

      const forbiddenWords = wordFilter.words.map((r) => r.word.toLowerCase());
      const userMessage = message.content.toLowerCase();

      for (const word of forbiddenWords) {
        if (userMessage.includes(word)) {
          await message.delete();

          const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setDescription(`:warning: Não é permitido dizer isso aqui.`);

          await message.channel.send({
            content: `<@${message.author.id}>`,
            embeds: [embed],
          });
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
};
