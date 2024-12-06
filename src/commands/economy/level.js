const {
  SlashCommandBuilder,
  Interaction,
  AttachmentBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const { RankCardBuilder, Font } = require("canvacord");
const calculateLevel = require("../../utils/calculateLevel")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Mostrar seu level ou de algum membro")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Usuário para mostrar o level")
        .setRequired(false)
    ),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply("Esse comando só pode ser executado dentro da guilda.");
      return;
    }

    await interaction.deferReply();

    const optionUser = interaction.options.getUser("user");
    const userId = optionUser || interaction.user.id;
    const userObj = await interaction.guild.members.fetch(userId);

    const guildId = interaction.guild.id;

    const userLevel = await Level.findOne({
      userId,
      guildId,
    });

    if (!userLevel) {
      interaction.editReply(
        optionUser
          ? `${userObj.user.tag} não possui nenhum level ainda.`
          : "Você não possui nenhum level."
      );
      return;
    }

    const rankCardBuilder = new RankCardBuilder()
      .setDisplayName(userObj.user.globalName)
      .setUsername("@" + userObj.user.username)
      .setAvatar(userObj.user.displayAvatarURL({ size: 256 }))
      .setCurrentXP(userLevel.xp)
      .setRequiredXP(calculateLevel(userLevel.level))
      .setLevel(userLevel.level)
      .setFonts(Font.loadDefault())
      .setOverlay(90)
      .setBackground("#23272a")
      .setStatus(userObj.presence ? userObj.presence.status : "offline");

    const rankCard = await rankCardBuilder.build();

    const attachment = new AttachmentBuilder(rankCard);
    const mentionedUser = "<@" + interaction.user.id + ">";

    await interaction.editReply({
      content: mentionedUser,
      files: [attachment],
    });
  },
};
