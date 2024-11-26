require("dotenv").config();

const {
  REST,
  Routes,
  ApplicationCommandOptionType,
  ChannelType,
} = require("discord.js");

const commands = [
  {
    name: "ip",
    description: "Retorna o IP do servidor",
  },
  {
    name: "welcome-setup",
    description: "Configurar evento de boas-vindas",
    options: [
      {
        name: "channel",
        description: "O canal no qual será enviado a mensagem",
        type: ApplicationCommandOptionType.Channel,
        required: true,
        channel_types: [ChannelType.GuildText],
      },
    ],
  },
  {
    name: "wordfilter-add",
    description: "Adicionar nova palavra ao filtro",
    options: [
      {
        name: "word",
        description: "Palavra que será filtrada na guilda",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: "animals",
    description: "Que tal apreciar um animal fofinho?",
    options: [
      {
        name: "type",
        description: "Selecione um animal",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "fox",
            value: "fox",
          },
          {
            name: "cat",
            value: "cat",
          },
        ],
        required: true,
      },
    ],
  },
  {
    name: "autorole-setup",
    description: "Configure o cargo automático no servidor",
    options: [
      {
        name: "role",
        description: "Cargo que será atribuido aos novos membros",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
