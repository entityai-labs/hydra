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
const { loadDatabase, saveDatabase } = require("./sql.js");
const hasPermission = require("./utils/hasPermission.js");
const Fastify = require("fastify")
const getAnimalData = require("./utils/getAnimalData.js");
const { handleStatus } = require("./status.js");

require("dotenv").config();

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

/** @type {import("sql.js").Database} */
let db;

const fastify = Fastify();
fastify.listen(3000, (err, address) => {
  if(err) {
    console.error(err)
  }

  console.log(`HTTP server running on ${address}`)
})

client.on(Events.ClientReady, async (c) => {
  db = await loadDatabase();
  handleStatus(client);

  console.log(`✅️ Bot connected as ${c.user.username}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const welcomeChannelQuery = db.prepare(
      `SELECT channel_id FROM welcome WHERE guild_id = ?`
    );
    const resultWelcomeChannel = welcomeChannelQuery.getAsObject([
      member.guild.id,
    ]);

    const roleIdQuery = db.prepare(
      `SELECT role_id FROM autorole WHERE guild_id = ?`
    );
    const resultRoleId = roleIdQuery.getAsObject([member.guild.id]);

    if (resultWelcomeChannel.channel_id) {
      const channel = await member.guild.channels.fetch(
        resultWelcomeChannel.channel_id
      );
      const memberRole = member.guild.roles.cache.get(resultRoleId.role_id);
      if (!channel || !memberRole) return;

      await member.roles.add(memberRole);
      channel.send(`Bem-vindo ao servidor <@${member.user.id}>!`);
    } else {
      console.error("SZLA")
    }
  } catch (error) {
    console.error(error)
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const db = await loadDatabase();

  try {
    const query = "SELECT word FROM word_filter";
    const result = db.exec(query);

    if (result.length > 0) {
      let words = result[0].values.map((row) => row[0]);

      for (const word of words) {
        if (message.content.toLowerCase().includes(word)) {
          await message
            .delete()
            .catch((err) => console.error("Erro ao deletar a mensagem:", err));

          const embed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(
              `:warning: Não é permitido dizer isso aqui seu bunda mole.`
            );

          message.channel.send({
            content: `<@${message.author.id}>`,
            embeds: [embed],
          });
        }
      }
    } 
  } catch (error) {
    console.error("Erro:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "autorole-setup") {
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return;

    const role = interaction.options.getRole("role");

    try {
      db.run(
        `INSERT INTO autorole (guild_id, role_id, role)
         VALUES (?, ?, ?)
         ON CONFLICT(guild_id)
         DO UPDATE SET role_id = excluded.role_id, role = excluded.role;`,
        [interaction.guild.id, role.id, role.name]
      );

      saveDatabase(db);

      const embed = new EmbedBuilder().setColor("Random").setDescription(`
        Auto-role configurado e salvo com sucesso no banco de dados.
  
        Role atual: <@&${role.id}>
        Data: \`\`${role.createdAt}\`\`
      `);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.commandName === "animals") {
    const animal = interaction.options.getString("type");
    const embed = new EmbedBuilder().setColor("Default");

    try {
      let imageUrl;
      let description;

      switch (animal) {
        case "fox": {
          const foxData = await getAnimalData("https://randomfox.ca/floof");
          imageUrl = foxData.image;
          description = `<@${interaction.user.id}> What does the fox say? 🦊 Aqui está uma raposa estilosa!`;
          embed.setImage(imageUrl);
          break;
        }
        case "cat": {
          const catData = await getAnimalData(
            "https://api.thecatapi.com/v1/images/search"
          );
          imageUrl = catData[0].url;
          description = `<@${interaction.user.id}> Meooow! 🐱 Aqui está um gatinho para alegrar o seu dia!`;
          embed.setImage(imageUrl);
          break;
        }
        default:
          await interaction.reply("Tipo de animal inválido.");
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
      console.error(error)
    }
  }

  if (interaction.commandName === "wordfilter-add") {
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return;

    const word = interaction.options.getString("word");

    try {
      db.run(`INSERT INTO word_filter (word) VALUES (?);`, [word]);
      saveDatabase(db);

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(
          `<:Minecraft:1310372150586249237> A palavra **${word}** foi inserida com sucesso no banco de dados.`
        );
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error)
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
      db.run(
        `INSERT INTO welcome (guild_id, channel_id) VALUES (?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id`,
        [interaction.guild.id, channel.id]
      );

      saveDatabase(db);

      interaction.reply({
        content: `Canal de boas-vindas configurado e salvo no banco de dados: <#${channel.id}>`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error)
    }
  }

  if (interaction.commandName === "ip") {
    const embed = new EmbedBuilder()
      .setFooter({
        text: `Request by ${interaction.user.globalName}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor("Random")
      .setDescription(
        `
    <:minecraftlogopng2:1310356302811238482> **Java Edition:** \`play.hydra-mc.xyz\`
    <:minecraftlogopng2:1310356302811238482> **Bedrock Edition:** \`bedrock.hydra-mc.xyz\`

    <:Minecraft:1310371998664232960> **Porta Padrão:** \`25976\`
    `
      );

    const message = `Olá <@${interaction.user.id}> aqui está uma lista de nossos IPs:`;

    interaction.reply({ content: message, embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
