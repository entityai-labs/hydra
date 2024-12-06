const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const Level = require("../../models/Level");
const { LeaderboardBuilder, Font } = require("canvacord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Mostrar ranking dos membros da guilda"),
  async execute(interaction) {
    try {
      const ranking = await Level.find({ guildId: interaction.guild.id })
        .sort({ level: -1, xp: -1 })
        .limit(5);

      if (ranking.length === 0) {
        return interaction.reply("O ranking não foi atualizado ou não existe.");
      }

      const players = await Promise.all(
        ranking.map(async (player, index) => {
          const member = await interaction.guild.members.fetch(player.userId);

          return {
            avatar: member?.user.displayAvatarURL({ size: 128 }) || "",
            username: member?.user.username || "unknown",
            displayName: member?.displayName || "null",
            level: player.level,
            xp: player.xp,
            rank: index + 1,
          };
        })
      );

      Font.loadDefault();
      const rankingCard = new LeaderboardBuilder()
        .setBackground(
          "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL3Jhd3BpeGVsX29mZmljZV81M19hX21pbmltYWxfYW5kX2xlc3NfZGV0YWlsX2lsbHVzdHJhdGlvbl9vZl9jaF8xN2NmMTIxNy1kNDM0LTRjYTYtYjIxYy04ZmQyMjQxMjlkN2EuanBn.jpg"
        )
        .setHeader({
          title: interaction.guild.name,
          image: interaction.guild.iconURL({ size: 256 }),
          subtitle: `${interaction.guild.memberCount} membros`,
        })
        .setPlayers(players);

      rankingCard.setVariant("default");
      const image = await rankingCard.build({
        format: "png",
      });
      const attachment = new AttachmentBuilder(image, {
        name: "leaderboard.png",
      });

      await interaction.reply({
        files: [attachment],
      });
    } catch (error) {
      console.log(error);
    }
  },
};
