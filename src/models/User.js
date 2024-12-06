const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  minecraftUUID: {
    type: String,
    unique: true,
  },
  nickname: {
    type: String,
    unique: true,
  },
  minecoins: {
    type: Number,
    default: 0,
  },
  dailyLastUsed: {
    type: Date,
  },
});

module.exports = model("User", UserSchema);
