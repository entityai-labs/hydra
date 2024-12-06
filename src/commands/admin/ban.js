const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Interaction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banir um usuário do servidor")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Usuário que será banido")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Razão do banimento")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

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

    await member.ban({
      deleteMessageSeconds: 60,
      reason
    });

    interaction.reply({
      content: `Você baniu o usuário ${member.user.username}!`,
      ephemeral: true,
    });
  },
};
