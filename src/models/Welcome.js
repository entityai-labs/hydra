const mongoose = require("mongoose");

const WelcomeSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  welcomeChannel: {
    type: String,
    required: true,
    unique: true,
  },
  roleId: {
    type: String,
    required: false,
    unique: true,
  },
});

module.exports = mongoose.model("Welcome", WelcomeSchema);
