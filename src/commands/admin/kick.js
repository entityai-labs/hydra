const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsar um usuário do servidor")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Usuário que será expulso")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Razão da expulsão")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  /**
   *
   * @param {Interaction} interaction
   */
  async execute(interaction) {
    const userOption = interaction.options.getUser("user");
    const reasonOption = interaction.options.getString("reason");
    const member = await interaction.guild.members.fetch(userOption);

    if (!member)
      return interaction.reply({
        content: "Usuário não encontrado.",
        ephemeral: true,
      });

    const reason = reasonOption || "Nenhuma razão foi providenciada";

    await member.kick(reason);

    interaction.reply({
      content: `Você kickou o usuário ${member.user.username}!`,
      ephemeral: true,
    });
  },
};
