const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silenciar um usuário do servidor")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Usuário que será silenciado")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Razão do silenciamento")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("Tempo de silenciamento")
        .setMinValue(300)
        .setMaxValue(3600)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const userOption = interaction.options.getUser("user");
    const reasonOption = interaction.options.getString("reason");
    const timeOption = interaction.options.getInt("time");
    const member = await interaction.guild.members.fetch(userOption);

    if (!member)
      return interaction.reply({
        content: "Usuário não encontrado.",
        ephemeral: true,
      });

    const reason = reasonOption || "Nenhuma razão foi providenciada";

    await member.timeout(timeOption, reason);

    interaction.reply({
      content: `Você silenciou o usuário ${member.user.username}!`,
      ephemeral: true,
    });
  },
};
