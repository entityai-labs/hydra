const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
  AttachmentBuilder,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const GreetingsCard = require("./classes/GreetingsCard.js");
const express = require("express");
const handleStatus = require("./status.js");
const Welcome = require("./models/Welcome.js");
const WordFilter = require("./models/WordFilter.js");
const getRandomExp = require("./utils/getRandomExp.js");
const Level = require("./models/Level.js");
const calculateLevel = require("./utils/calculateLevel.js");
const connectDB = require("./config/database.js");
const { Font } = require("canvacord");

require("dotenv").config();
const port = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

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

  console.log(`Bot connected as ${c.user.tag}!`);
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

    Font.loadDefault();
    const greetingsCard = new GreetingsCard()
      .setType("welcome")
      .setAvatar(member.user.displayAvatarURL({ size: 256 }))
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

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(process.env.TOKEN);
