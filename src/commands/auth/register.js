const { SlashCommandBuilder, Interaction } = require("discord.js");
const User = require("../../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Registrar usuário Minecraft")
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("Seu nickname do Minecraft")
        .setRequired(true)
    ),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const nickname = interaction.options.getString("nickname");
    let uuid;

    try {
      await interaction.deferReply();

      const userAlreadyExists = await User.findOne({
        discordId: interaction.user.id,
        guildId: interaction.guild.id,
      });

      if (userAlreadyExists) {
        interaction.editReply(`Você já está registrado.`);
        return;
      }

      const result = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${nickname}`
      );

      switch (result.status) {
        case 404:
          uuid = "Não encontrado";
          break;
        case 200:
          const data = await result.json();
          uuid = data.id;
          break;
        default:
          break;
      }

      const user = await User.create({
        guildId: interaction.guild.id,
        discordId: interaction.user.id,
        nickname,
        minecraftUUID: uuid,
        dailyLastUsed: new Date(0)
      });

      interaction.editReply(
        `Olá ${user.nickname}! Você foi registrado com sucesso.`
      );
    } catch (error) {
      console.log(error);
    }
  },
};
