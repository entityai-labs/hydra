const { Events, GuildMember, AttachmentBuilder } = require("discord.js");
const Welcome = require("../models/Welcome");
const GreetingsCard = require("../classes/GreetingsCard");
const { Font } = require("canvacord");

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,

  /**
   *
   * @param {GuildMember} member
   */
  async execute(member) {
    try {
      const welcome = await Welcome.findOne({ guildId: member.guild.id });
      if (!welcome) {
        console.error("You need to setup Welcome Data.");
        return;
      }

      const channel = await member.guild.channels.fetch(welcome.welcomeChannel);
      const role = member.guild.roles.cache.get(welcome.roleId);

      if (!channel || !role) {
        console.error(`Role or channel not found`);
        return;
      }

      await member.roles.add(role);

      Font.loadDefault();
      const greetingsCard = new GreetingsCard()
        .setType("welcome")
        .setAvatar(member.user.displayAvatarURL({ size: 256, forceStatic: true }))
        .setDisplayName(member.user.globalName)
        .setMessage(`Bem-vindo(a) ao HydraMC!`);

      const card = await greetingsCard.build();
      let attachment = new AttachmentBuilder(card, {
        name: "welcome.png",
      });

      channel.send({ files: [attachment] });
    } catch (error) {
      console.error(error);
    }
  },
};
