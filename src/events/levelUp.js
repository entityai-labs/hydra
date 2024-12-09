const { Events, Message } = require("discord.js");
const getRandomExp = require("../utils/getRandomExp");
const calculateLevel = require("../utils/calculateLevel");
const Level = require("../models/Level");

module.exports = {
  name: Events.MessageCreate,
  once: false,

  /**
   *
   * @param {Message} message
   */
  async execute(message) {
    if (message.author.bot || !message.inGuild()) return;

    const randomExp = getRandomExp(5, 15);

    try {
      const userLevel = await Level.findOne({
        guildId: message.guild.id,
        userId: message.author.id,
      });

      if (userLevel) {
        userLevel.xp += randomExp;

        if (userLevel.xp > calculateLevel(userLevel.level)) {
          userLevel.xp = 0;
          userLevel.level += 1;

          message.channel.send(
            `<@${message.author.id}> **Parabéns, você subiu para o level ${userLevel.level}!**`
          );
        }

        await userLevel.save().catch((e) => {
          console.log(`Erro ao salvar nível do usuário: ${e}`);
        });
      } else {
        const newUserLevel = await Level.create({
          userId: message.author.id,
          guildId: message.guild.id,
          xp: randomExp,
        });

        await newUserLevel.save();
      }
    } catch (error) {
      console.error(error);
    }
  },
};
