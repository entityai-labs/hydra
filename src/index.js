const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const hasPermission = require("./utils/hasPermission.js");
const express = require("express");
const getAnimalData = require("./utils/getAnimalData.js");
const { handleStatus } = require("./status.js");
const Welcome = require("./models/Welcome.js");
const WordFilter = require("./models/WordFilter.js");
const getRandomExp = require("./utils/getRandomExp.js");
const Level = require("./models/Level.js");
const calculateLevel = require("./utils/calculateLevel.js");
const connectDB = require("./config/database.js");

require("dotenv").config();
const port = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
});

const app = express();

app.get("/", (req, res) => {
  res.send("The bot is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

client.on("ready", async (c) => {
  await connectDB();
  handleStatus(client);

  console.log(`Bot connected as ${c.user.username}!`);
});

client.on("guildMemberAdd", async (member) => {
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

    channel.send(`Bem-vindo ao servidor, <@${member.user.id}>!`);
  } catch (error) {
    console.error(error);
  }
});

client.on("messageCreate", async (message) => {
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
          `${message.member} **Parabéns, você subiu para o level ${userLevel.level}!**`
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

  try {
    const wordFilter = await WordFilter.findOne({ guildId: message.guild.id });
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
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "autorole-setup") {
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return;

    const role = interaction.options.getRole("role");

    try {
      const welcome = await Welcome.findOne({ guildId: interaction.guild.id });
      if (!welcome) {
        console.error(`Welcome data does not exists`);
        return;
      }

      welcome.roleId = role.id;
      await welcome.save();

      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setDescription("Auto-role configurado e salvo.");

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.commandName === "animals") {
    const animal = interaction.options.getString("type");
    const embed = new EmbedBuilder().setColor("#2B2D31");

    try {
      let imageUrl;
      let description;

      switch (animal) {
        case "fox": {
          const foxData = await getAnimalData("https://randomfox.ca/floof");
          imageUrl = foxData.image;
          embed.setTitle(
            `<@${interaction.user.id}> **What does the fox say? 🦊 Aqui está uma raposa estilosa!**`
          );
          embed.setImage(imageUrl);
          break;
        }
        case "cat": {
          const catData = await getAnimalData(
            "https://api.thecatapi.com/v1/images/search"
          );
          imageUrl = catData[0].url;
          embed.setTitle(
            `<@${interaction.user.id}> **Meooow! 🐱 Aqui está um gatinho para alegrar o seu dia!**`
          );
          embed.setImage(imageUrl);
          break;
        }
        default:
          return;
      }

      const button = new ButtonBuilder()
        .setLabel("Download")
        .setStyle(ButtonStyle.Link)
        .setURL(imageUrl);
      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        content: description,
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.commandName === "wordfilter-add") {
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return;

    const word = interaction.options.getString("word");

    try {
      await WordFilter.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $addToSet: { words: { word } } },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setDescription(
          `<:Minecraft:1310372150586249237> A palavra **${word}** foi inserida com sucesso no banco de dados.`
        );
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.commandName === "welcome-setup") {
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return;

    const channelId = interaction.options.get("channel").value;
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "Precisa ser um canal de texto válido.",
        ephemeral: true,
      });
    }

    try {
      await Welcome.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { guildId: interaction.guild.id, welcomeChannel: channel.id },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setDescription("Canal de boas-vindas configurado e salvo.");

      interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.commandName === "ip") {
    const embed = new EmbedBuilder()
      .setFooter({
        text: `Request by ${interaction.user.globalName}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor("#2B2D31")
      .setDescription(
        `
    <:minecraftlogopng2:1310356302811238482> **Java Edition:** \`play.hydra-mc.xyz\`
    <:minecraftlogopng2:1310356302811238482> **Bedrock Edition:** \`bedrock.hydra-mc.xyz\`

    <:Minecraft:1310371998664232960> **Porta Padrão:** \`25976\`
    `
      );

    interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "level") {
    if (!interaction.inGuild()) {
      interaction.reply("Esse comando só pode ser executado dentro da guilda.");
      return;
    }

    await interaction.deferReply();

    const optionUserId = interaction.options.get("member")?.value;
    const userId = optionUserId || interaction.user.id;
    const userObj = await interaction.guild.members.fetch(userId);

    const guildId = interaction.guild.id;

    const userLevel = await Level.findOne({
      userId,
      guildId,
    });

    if (!userLevel) {
      interaction.editReply(
        optionUserId
          ? `${userObj.user.tag} não possui nenhum level ainda.`
          : "Você não possui nenhum level."
      );
      return;
    }

    interaction.editReply({
      content: `**O level atual de ${userObj.user.username} é ${userLevel.level}.**`,
    });
  }
});

client.login(process.env.TOKEN);
