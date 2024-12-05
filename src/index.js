const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ChannelType,
  Collection,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
} = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');
const hasPermission = require("./utils/hasPermission.js");
const GreetingsCard = require("./classes/GreetingsCard.js");
const express = require("express");
const getAnimalData = require("./utils/getAnimalData.js");
const handleStatus = require("./status.js");
const Welcome = require("./models/Welcome.js");
const WordFilter = require("./models/WordFilter.js");
const getRandomExp = require("./utils/getRandomExp.js");
const Level = require("./models/Level.js");
const calculateLevel = require("./utils/calculateLevel.js");
const connectDB = require("./config/database.js");
const { RankCardBuilder, Font, LeaderboardBuilder } = require("canvacord");

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

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
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
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
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
    console.log(rankCardBuilder);

    const attachment = new AttachmentBuilder(rankCard);
    const mentionedUser = "<@" + interaction.user.id + ">";

    await interaction.editReply({
      content: mentionedUser,
      files: [attachment],
    });
  }

  if (interaction.commandName === "ranking") {
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
  }
});

client.login(process.env.TOKEN);
