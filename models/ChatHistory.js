const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatHistorySchema = new Schema({
  posiljaoc: {
    type: String
  },
  vrijeme: {
    type: String
  },
  poruka: {
    type: String,
  }
},{ versionKey: false });

module.exports = ChatHistory = mongoose.model('chatHistory', ChatHistorySchema);