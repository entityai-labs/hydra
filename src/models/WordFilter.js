const mongoose = require("mongoose");

const WordFilterSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  words: [{ word: String }],
});

module.exports = mongoose.model("WordFilter", WordFilterSchema);
